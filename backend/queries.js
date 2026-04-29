const { query, T, isReady } = require('./bigquery');

const fmt = (dateVal) => {
  if (!dateVal) return 'N/A';
  try { return new Date(dateVal.value || dateVal).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return String(dateVal); }
};

/**
 * Searches for accounts in the SFDC_Accounts BigQuery table.
 * Fetches rich account-level fields for the search result list.
 */
async function searchAccounts(searchTerm, limit = 15, filters = {}) {
  const sql = `
    SELECT 
      a.Id as id,
      a.Name as name,
      COUNT(c.Id) as critical_tickets
    FROM ${T('SFDC_Accounts')} a
    LEFT JOIN ${T('SFDC_Case')} c ON c.AccountId = a.Id 
      AND c.Status NOT LIKE '%Closed%' 
      AND c.Status NOT LIKE '%Resolved%' 
      AND c.Status NOT LIKE '%Completed%'
    WHERE (LOWER(a.Name) LIKE LOWER(@searchTerm) OR LOWER(a.Id) LIKE LOWER(@searchTerm))
    ${filters.renewal ? `AND EXISTS (SELECT 1 FROM ${T('SFDC_Opportunity')} o WHERE o.AccountId = a.Id AND o.StageName LIKE '%Renewal%')` : ''}
    ${filters.implementation ? `AND EXISTS (SELECT 1 FROM ${T('SFDC_Order__c')} ord WHERE ord.PMC__c = a.Id AND ord.Implementation_Completion_Date__c IS NULL)` : ''}
    GROUP BY a.Id, a.Name
    LIMIT @limit
  `;
  const rows = await query(sql, { searchTerm: `%${searchTerm}%`, limit });
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    health_score: Math.max(0, 100 - (r.critical_tickets * 5))
  }));
}

/**
 * Builds the full knowledge graph for a single account, pulling rich fields
 * from all 7 BigQuery tables in parallel.
 */
async function getAccountGraph(accountId) {
  const queries = {
    // ── 1. Account (PMC) ── rich profile fields
    account: query(`
      SELECT Id, Name, 
        client_success_manager__r_name, client_success_manager__r_email,
        Total_ACV__c, Total_Units_f__c, Total_Properties_f__c,
        Risk_Level__c, Core__c, Account_Tier__c, Territory__c,
        Business_Type__c, Primary_Type__c,
        Property_Mgmt_Solution_Primary__c, Property_Mgmt_Solution_Secondary__c,
        BillingCity, BillingState, BillingCountry,
        OMS_Account_ID__c
      FROM ${T('SFDC_Accounts')} WHERE Id = @id`, { id: accountId }),

    // ── 2. Support Tickets ── all actionable case fields
    // Capped at 20 most recent open tickets — prevents graph explosion on large accounts
    cases: query(`
      SELECT Id, CaseNumber, Status, Priority, Subject, description,
        Support_Product__c, CreatedDate, Escalation_Status__c,
        Area__c, Sub_Area__c, Reason, Type,
        Business_Days_Open__c, Out_of_SLS__c, SLS_Status__c,
        Re_Open_Count__c, Channel__c, PME_Number__c,
        Escalated_to_Dev_DateTime__c, Escalated_to_Tier_2_DateTime__c
      FROM ${T('SFDC_Case')} WHERE AccountId = @id
      ORDER BY CreatedDate DESC LIMIT 20`, { id: accountId }),

    // ── 3. Health Events ── all risk signal fields
    healthEvents: query(`
      SELECT Id, Name, Status__c as status, Health_State__c as severity,
        Title__c, Description__c, Issue_Type__c, Root_Cause__c,
        Number_of_Sites_at_Risk__c, Number_of_Units_at_Risk__c,
        Impacted_ACV__c, Estimated_ACV_at_Risk__c,
        Target_Completion__c, Reported_On__c,
        Action_Plan__c, Sub_Status__c
      FROM ${T('SFDC_ClientHealthEvents__c')} WHERE Accounts__c = @id
      ORDER BY CreatedDate DESC LIMIT 10`, { id: accountId }),

    // ── 4. PME ── full escalation + ADO/TFS fields
    pme: query(`
      SELECT Id, Name, Escalation_Status__c as escalation_status, Priority__c as severity,
        PME_Owner_Name__c, CreatedDate, Due_Date__c,
        Description__c, Summary__c, Issue_Summary__c,
        Business_Impact__c, Customer_Impact__c, Error_Message__c,
        Functional_Area__c, Support_Product__c,
        Azure_DevOps_URL__c, Azure_DevOps_ID__c, Azure_DevOps_State__c, Azure_DevOps_Priority__c,
        TFS_ID__c, Recurring_PME__c,
        Resolution_Summary__c, Date_Closed__c,
        Business_Days_Open__c, Escalation_Days_Open__c
      FROM ${T('SFDC_ProblemManagementEscalation')} WHERE PW_Account_Name__c = @id
      ORDER BY CreatedDate DESC LIMIT 8`, { id: accountId }),

    // ── 5. Renewals ── all deal fields
    opportunities: query(`
      SELECT Id, Name, StageName, CloseDate, Probability,
        ExpectedRevenue, Primary_Competitor__c,
        Reasons_Lost__c, Reasons_Lost_Comments__c,
        ForecastCategoryName, NextStep
      FROM ${T('SFDC_Opportunity')} WHERE AccountId = @id AND StageName LIKE '%Renewal%'
      ORDER BY CloseDate ASC LIMIT 10`, { id: accountId }),

    // ── 6. Implementations ── full order lifecycle fields
    orders: query(`
      SELECT Id, Name, Status__c, Phase__c, Product_Name__c, Product_Family__c,
        Implementation_Completion_Date__c, Scheduled_Go_LIVE_Date__c,
        Implementation_Start_Date__c, Order_Create_Date__c,
        SLA_Violation_Days__c, Is_Currently_in_SLA_Violation__c,
        Days_Since_Implementation_Started__c, Days_in_Current_Phase__c,
        Backlog_Reason__c, Client_Success_Manager__c
      FROM ${T('SFDC_Order__c')} WHERE PMC__c = @id AND Implementation_Completion_Date__c IS NULL
      ORDER BY CreatedDate DESC LIMIT 10`, { id: accountId }),

    // ── 7. Cancellations ── full churn signal fields
    cancellations: query(`
      SELECT Id, Name, Status__c as status,
        Reason_for_Cancellation__c, Non_OMS_Products__c,
        Non_OMS_Effective_Date__c, Submitted_Date__c,
        PMC_Name__c, Unique_Products__c, Unique_Sites__c
      FROM ${T('SFDC_Cancellation')} WHERE PMC__c = @id
      ORDER BY Submitted_Date__c DESC LIMIT 12`, { id: accountId })
  };

  const results = await Promise.allSettled(Object.values(queries));
  const keys = Object.keys(queries);
  const data = {};
  keys.forEach((key, index) => {
    if (results[index].status === 'fulfilled') {
      data[key] = results[index].value;
    } else {
      console.warn(`[BigQuery Warning] Partial Graph Data - Failed to fetch ${key}:`, results[index].reason.message);
      data[key] = [];
    }
  });

  const nodes = [];
  const links = [];

  // ── 1. Account Node (Center) ──
  const acc = data.account[0] || {};
  nodes.push({
    id: accountId,
    label: 'Account',
    properties: {
      name: acc.Name || `Account (${accountId})`,
      csm: acc.client_success_manager__r_name || 'Unassigned',
      csm_email: acc.client_success_manager__r_email || '',
      total_acv: acc.Total_ACV__c ? `$${Number(acc.Total_ACV__c).toLocaleString()}` : 'N/A',
      total_units: acc.Total_Units_f__c ? Number(acc.Total_Units_f__c).toLocaleString() : 'N/A',
      total_properties: acc.Total_Properties_f__c ? Number(acc.Total_Properties_f__c).toLocaleString() : 'N/A',
      risk_level: acc.Risk_Level__c || 'Unknown',
      core: acc.Core__c === true ? 'Core' : (acc.Core__c === false ? 'Non-Core' : 'N/A'),
      tier: acc.Account_Tier__c || 'N/A',
      territory: acc.Territory__c || 'N/A',
      business_type: acc.Business_Type__c || 'N/A',
      primary_solution: acc.Property_Mgmt_Solution_Primary__c || 'N/A',
      secondary_solution: acc.Property_Mgmt_Solution_Secondary__c || 'N/A',
      location: [acc.BillingCity, acc.BillingState, acc.BillingCountry].filter(Boolean).join(', ') || 'N/A',
      oms_id: acc.OMS_Account_ID__c || 'N/A'
    }
  });

  // ── 2. Ticket Nodes ──
  data.cases.forEach(c => {
    const status = c.Status || '';
    const isClosed = status.includes('Closed') || status.includes('Resolved') || status.includes('Completed');
    if (!isClosed) {
      const nodeId = `case_${c.Id}`;
      nodes.push({
        id: nodeId,
        label: 'Ticket',
        properties: {
          severity:          c.Priority || 'Unassigned',
          status:            status,
          case_number:       c.CaseNumber,
          subject:           c.Subject || 'No Subject',
          description:       c.description || 'No description available.',
          product:           c.Support_Product__c || 'General',
          area:              c.Area__c || 'N/A',
          sub_area:          c.Sub_Area__c || 'N/A',
          reason:            c.Reason || 'N/A',
          channel:           c.Channel__c || 'N/A',
          days_open:         c.Business_Days_Open__c != null ? `${c.Business_Days_Open__c} business days` : 'N/A',
          sls_status:        c.SLS_Status__c || 'N/A',
          out_of_sls:        c.Out_of_SLS__c ? '⚠️ Yes' : 'No',
          reopen_count:      c.Re_Open_Count__c || '0',
          escalation_status: c.Escalation_Status__c || 'Not Escalated',
          linked_pme:        c.PME_Number__c || 'None',
          created:           fmt(c.CreatedDate),
          escalated_to_dev:  fmt(c.Escalated_to_Dev_DateTime__c),
          escalated_to_t2:   fmt(c.Escalated_to_Tier_2_DateTime__c)
        }
      });
      links.push({ source: nodeId, target: accountId, label: 'HAS_TICKET' });
    }
  });

  // ── 3. Health Event Nodes ──
  data.healthEvents.forEach(he => {
    const nodeId = `he_${he.Id}`;
    nodes.push({
      id: nodeId,
      label: 'HealthEvent',
      properties: {
        status:             he.status || 'Open',
        severity:           he.severity || 'N/A',
        title:              he.Title__c || he.Name || 'Health Event',
        description:        he.Description__c || 'No description.',
        issue_type:         he.Issue_Type__c || 'N/A',
        root_cause:         he.Root_Cause__c || 'N/A',
        sub_status:         he.Sub_Status__c || 'N/A',
        sites_at_risk:      he.Number_of_Sites_at_Risk__c || '0',
        units_at_risk:      he.Number_of_Units_at_Risk__c || '0',
        impacted_acv:       he.Impacted_ACV__c ? `$${Number(he.Impacted_ACV__c).toLocaleString()}` : 'N/A',
        estimated_acv_risk: he.Estimated_ACV_at_Risk__c ? `$${Number(he.Estimated_ACV_at_Risk__c).toLocaleString()}` : 'N/A',
        action_plan:        he.Action_Plan__c || 'No action plan documented.',
        reported_on:        fmt(he.Reported_On__c),
        target_completion:  fmt(he.Target_Completion__c)
      }
    });
    links.push({ source: nodeId, target: accountId, label: 'HAS_HEALTH_EVENT' });
  });

  // ── 4. PME Nodes ──
  data.pme.forEach(p => {
    const nodeId = `pme_${p.Id}`;
    nodes.push({
      id: nodeId,
      label: 'PME',
      properties: {
        status:            p.escalation_status || 'Open',
        priority:          p.severity || 'Unknown',
        number:            p.Name || p.Id,
        pme_owner:         p.PME_Owner_Name__c || 'Unassigned',
        created_date:      fmt(p.CreatedDate),
        due_date:          fmt(p.Due_Date__c),
        date_closed:       fmt(p.Date_Closed__c),
        days_open:         p.Business_Days_Open__c != null ? `${p.Business_Days_Open__c} business days` : 'N/A',
        escalation_days:   p.Escalation_Days_Open__c != null ? `${p.Escalation_Days_Open__c} days` : 'N/A',
        summary:           p.Summary__c || p.Issue_Summary__c || 'No Summary.',
        description:       p.Description__c || 'No Description.',
        business_impact:   p.Business_Impact__c || 'N/A',
        customer_impact:   p.Customer_Impact__c || 'N/A',
        error_message:     p.Error_Message__c || 'N/A',
        functional_area:   p.Functional_Area__c || 'N/A',
        product:           p.Support_Product__c || 'N/A',
        recurring:         p.Recurring_PME__c ? '⚠️ Yes — Recurring Issue' : 'No',
        resolution_summary:p.Resolution_Summary__c || 'Not yet resolved.',
        tfs_link:          p.Azure_DevOps_URL__c || '',
        tfs_azure_id:      p.Azure_DevOps_ID__c || '',
        tfs_status:        p.Azure_DevOps_State__c || 'N/A',
        tfs_priority:      p.Azure_DevOps_Priority__c || 'N/A',
        tfs_legacy_id:     p.TFS_ID__c || 'N/A'
      }
    });
    links.push({ source: nodeId, target: accountId, label: 'ESCALATED_TO' });
  });

  // ── 5. Renewal Nodes ──
  data.opportunities.forEach(opp => {
    const nodeId = `opp_${opp.Id}`;
    nodes.push({
      id: nodeId,
      label: 'Renewal',
      properties: {
        stage:        opp.StageName,
        name:         opp.Name,
        close_date:   fmt(opp.CloseDate),
        probability:  opp.Probability != null ? `${opp.Probability}%` : 'N/A',
        expected_rev: opp.ExpectedRevenue ? `$${Number(opp.ExpectedRevenue).toLocaleString()}` : 'N/A',
        competitor:   opp.Primary_Competitor__c || 'None identified',
        forecast:     opp.ForecastCategoryName || 'N/A',
        next_step:    opp.NextStep || 'No next step logged.',
        lost_reason:  opp.Reasons_Lost__c || 'N/A'
      }
    });
    links.push({ source: nodeId, target: accountId, label: 'HAS_RENEWAL' });
  });

  // ── 6. Implementation Nodes ──
  data.orders.forEach(ord => {
    const nodeId = `ord_${ord.Id}`;
    nodes.push({
      id: nodeId,
      label: 'Implementation',
      properties: {
        product:       ord.Product_Name__c || ord.Name || 'Unknown Product',
        product_family:ord.Product_Family__c || 'N/A',
        phase:         ord.Phase__c || 'Unknown',
        status:        ord.Status__c || 'Unknown',
        days_in_phase: ord.Days_in_Current_Phase__c != null ? `${ord.Days_in_Current_Phase__c} days` : 'N/A',
        days_running:  ord.Days_Since_Implementation_Started__c != null ? `${ord.Days_Since_Implementation_Started__c} days` : 'N/A',
        sla_violation: ord.Is_Currently_in_SLA_Violation__c ? `⚠️ Yes (${ord.SLA_Violation_Days__c || 0} days)` : 'No',
        backlog_reason:ord.Backlog_Reason__c || 'N/A',
        start_date:    fmt(ord.Implementation_Start_Date__c),
        target_go_live:fmt(ord.Scheduled_Go_LIVE_Date__c),
        created:       fmt(ord.Order_Create_Date__c)
      }
    });
    links.push({ source: nodeId, target: accountId, label: 'IMPLEMENTING' });
  });

  // ── 7. Cancellation Nodes ──
  data.cancellations.forEach(canc => {
    const nodeId = `canc_${canc.Id}`;
    nodes.push({
      id: nodeId,
      label: 'Cancellation',
      properties: {
        status:          canc.status || 'Submitted',
        reason:          canc.Reason_for_Cancellation__c || 'No reason logged.',
        products:        canc.Non_OMS_Products__c || 'N/A',
        unique_products: canc.Unique_Products__c || 'N/A',
        unique_sites:    canc.Unique_Sites__c || 'N/A',
        effective_date:  fmt(canc.Non_OMS_Effective_Date__c),
        submitted_date:  fmt(canc.Submitted_Date__c),
        pmc_name:        canc.PMC_Name__c || 'N/A'
      }
    });
    links.push({ source: nodeId, target: accountId, label: 'CANCELLED' });
  });

  // ── 8. Account Plan (synthesized from live data) ──
  const planId = `plan_${accountId}`;
  nodes.push({
    id: planId,
    label: 'AccountPlan',
    properties: {
      classification:    acc.Core__c === true ? 'Core' : 'Non-Core',
      primary_solution:  acc.Property_Mgmt_Solution_Primary__c || 'RealPage Property Management',
      secondary_solution:acc.Property_Mgmt_Solution_Secondary__c || 'N/A',
      arr:               acc.Total_ACV__c || 0,
      csm_owner:         acc.client_success_manager__r_name || 'Unassigned'
    }
  });
  links.push({ source: planId, target: accountId, label: 'HAS_PLAN' });

  return { nodes, links };
}

module.exports = { searchAccounts, getAccountGraph };
