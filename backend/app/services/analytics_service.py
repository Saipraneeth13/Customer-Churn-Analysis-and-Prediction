from typing import Dict, Any, List, Optional
import math
import pandas as pd
import numpy as np

from app.services.data_service import data_service
from app.schemas import (
    KPISummary, KeyInsight, SegmentMetric, CustomerItem, CustomerDetail,
    CustomersResponse, RiskBandSummary, RetentionScenarioRequest, RetentionScenarioResponse,
    MonthlyChargeBand, HistogramBin, FunnelStep
)

class AnalyticsService:
    def get_kpis(self, filter_contract: Optional[str] = None, filter_tenure_group: Optional[str] = None) -> KPISummary:
        df = data_service.df.copy()
        if filter_contract and filter_contract != "all":
            df = df[df["Contract"] == filter_contract]
        if filter_tenure_group and filter_tenure_group != "all":
            df = df[df["tenure_group"] == filter_tenure_group]

        total = len(df)
        if total == 0:
            return KPISummary(
                total_customers=0,
                overall_churn_rate=0.0,
                churned_customers=0,
                retained_customers=0,
                total_monthly_revenue=0.0,
                monthly_revenue_at_risk=0.0,
                monthly_revenue_at_risk_pct=0.0,
                high_risk_customers=0,
                high_risk_revenue_exposure=0.0,
                actual_churn_revenue_lost=0.0,
                model_roc_auc=0.835,
                retention_pulse="No Data",
                retention_pulse_status="healthy"
            )

        churned = int(df["Churn"].sum())
        retained = total - churned
        churn_rate = round(float(churned / total) * 100, 2)
        total_monthly_rev = round(float(df["MonthlyCharges"].sum()), 2)

        # Actual revenue lost to churn (historical label)
        actual_lost_rev = round(float(df[df["Churn"] == 1]["MonthlyCharges"].sum()), 2)

        # High-risk segment (adhering strictly to 03_train_model.py: risk_band == "High", prob > 0.70)
        high_risk_df = df[df["risk_band"] == "High"]
        high_risk_count = len(high_risk_df)
        high_risk_rev = round(float(high_risk_df["MonthlyCharges"].sum()), 2)
        rev_at_risk_pct = round((high_risk_rev / total_monthly_rev * 100), 2) if total_monthly_rev > 0 else 0.0

        # Retention pulse rating
        if churn_rate >= 30.0:
            pulse = "Critical Exposure"
            pulse_status = "critical"
        elif churn_rate >= 20.0:
            pulse = "Elevated Risk"
            pulse_status = "warning"
        else:
            pulse = "Stable Retention"
            pulse_status = "healthy"

        return KPISummary(
            total_customers=total,
            overall_churn_rate=churn_rate,
            churned_customers=churned,
            retained_customers=retained,
            total_monthly_revenue=total_monthly_rev,
            monthly_revenue_at_risk=high_risk_rev,  # Monthly revenue exposure of high-risk segment
            monthly_revenue_at_risk_pct=rev_at_risk_pct,
            high_risk_customers=high_risk_count,
            high_risk_revenue_exposure=high_risk_rev,
            actual_churn_revenue_lost=actual_lost_rev,
            model_roc_auc=0.835,
            retention_pulse=pulse,
            retention_pulse_status=pulse_status
        )

    def get_insights(self) -> List[KeyInsight]:
        df = data_service.df
        overall_rate = float(df["Churn"].mean() * 100)

        # 1. Contract insight
        m2m_df = df[df["Contract"] == "Month-to-month"]
        two_yr_df = df[df["Contract"] == "Two year"]
        m2m_rate = float(m2m_df["Churn"].mean() * 100)
        two_yr_rate = float(two_yr_df["Churn"].mean() * 100)
        diff_contract = round(m2m_rate - two_yr_rate, 1)

        # 2. Tenure insight
        early_df = df[df["tenure_group"] == "0-12 months"]
        mature_df = df[df["tenure_group"] == "49+ months"]
        early_rate = float(early_df["Churn"].mean() * 100)
        mature_rate = float(mature_df["Churn"].mean() * 100)
        diff_tenure = round(early_rate - mature_rate, 1)

        # 3. Payment method insight
        echeck_df = df[df["PaymentMethod"] == "Electronic check"]
        cc_df = df[df["PaymentMethod"] == "Credit card (automatic)"]
        echeck_rate = float(echeck_df["Churn"].mean() * 100)
        cc_rate = float(cc_df["Churn"].mean() * 100)
        diff_payment = round(echeck_rate - cc_rate, 1)

        # 4. Internet service insight
        fiber_df = df[df["InternetService"] == "Fiber optic"]
        dsl_df = df[df["InternetService"] == "DSL"]
        fiber_rate = float(fiber_df["Churn"].mean() * 100)
        dsl_rate = float(dsl_df["Churn"].mean() * 100)
        diff_internet = round(fiber_rate - dsl_rate, 1)

        # 5. High risk revenue exposure (standardized >70% risk band)
        high_risk_df = df[df["risk_band"] == "High"]
        high_risk_rev = float(high_risk_df["MonthlyCharges"].sum())
        total_rev = float(df["MonthlyCharges"].sum())
        high_risk_pct = round(len(high_risk_df) / len(df) * 100, 1)
        rev_pct = round(high_risk_rev / total_rev * 100, 1) if total_rev > 0 else 0.0

        insights = [
            KeyInsight(
                id="contract_disparity",
                title="Contract Commitment Cliff",
                description=f"Month-to-month customers exhibit a 42.7% churn rate, compared with only 2.8% for two-year contracts.",
                impact=f"+{diff_contract:.1f} pp delta",
                metric_value=f"{m2m_rate:.1f}%",
                benchmark=f"2-year: {two_yr_rate:.1f}%",
                business_relevance="Converting month-to-month accounts to annual agreements represents the highest single retention leverage point.",
                category="Contract",
                rank=1
            ),
            KeyInsight(
                id="tenure_dropoff",
                title="First-Year Customer Hazard",
                description=f"Subscribers in their first 12 months show a 47.7% churn rate, dropping to 9.5% for accounts past 4 years.",
                impact=f"+{diff_tenure:.1f} pp early risk",
                metric_value=f"{early_rate:.1f}%",
                benchmark=f"49+ mos: {mature_rate:.1f}%",
                business_relevance="The first 90–180 days are critical for proactive onboarding and relationship stabilization.",
                category="Tenure",
                rank=2
            ),
            KeyInsight(
                id="payment_friction",
                title="Electronic Check Billing Friction",
                description=f"Electronic check customers churn at 45.3%, nearly triple the rate of automatic credit card billing (15.3%).",
                impact=f"+{diff_payment:.1f} pp billing gap",
                metric_value=f"{echeck_rate:.1f}%",
                benchmark=f"Auto-Pay: {cc_rate:.1f}%",
                business_relevance="Incentivizing auto-pay enrollment addresses procedural churn caused by billing friction.",
                category="Billing",
                rank=3
            ),
            KeyInsight(
                id="fiber_pricing",
                title="Fiber Optic Price Sensitivity",
                description=f"Fiber optic accounts churn at 41.9% vs 19.0% for DSL, reflecting elevated monthly charges ($70+/mo).",
                impact=f"+{diff_internet:.1f} pp service gap",
                metric_value=f"{fiber_rate:.1f}%",
                benchmark=f"DSL: {dsl_rate:.1f}%",
                business_relevance="Fiber optic users need enhanced tier support and bundling to justify premium price points.",
                category="Internet",
                rank=4
            ),
            KeyInsight(
                id="high_risk_exposure",
                title="Concentrated Monthly Revenue Exposure",
                description=f"{len(high_risk_df):,} accounts are scored as high-risk (>70% probability), accounting for ${high_risk_rev:,.0f} in monthly billing.",
                impact=f"${high_risk_rev:,.0f}/mo at risk",
                metric_value=f"{len(high_risk_df):,} accounts",
                benchmark=f"{high_risk_pct}% of customer base",
                business_relevance=f"Prioritizing outreach on this high-risk group protects {rev_pct:.0f}% of recurring monthly billing.",
                category="Revenue",
                rank=5
            )
        ]

        return insights

    def get_segment_metrics(
        self,
        column: str,
        filter_contract: Optional[str] = None,
        filter_tenure_group: Optional[str] = None
    ) -> List[SegmentMetric]:
        df = data_service.df.copy()
        if filter_contract and filter_contract != "all":
            df = df[df["Contract"] == filter_contract]
        if filter_tenure_group and filter_tenure_group != "all":
            df = df[df["tenure_group"] == filter_tenure_group]

        if column not in df.columns or len(df) == 0:
            return []

        avg_churn_rate = float(df["Churn"].mean() * 100)
        results = []

        grouped = df.groupby(column)
        for name, group in grouped:
            total_cust = len(group)
            churned_cust = int(group["Churn"].sum())
            retained_cust = total_cust - churned_cust
            churn_pct = round(float(churned_cust / total_cust) * 100, 1)
            monthly_rev = round(float(group["MonthlyCharges"].sum()), 2)
            rev_at_risk = round(float(group[group["Churn"] == 1]["MonthlyCharges"].sum()), 2)
            diff_from_avg = round(churn_pct - avg_churn_rate, 1)

            results.append(SegmentMetric(
                segment_name=str(name),
                customers=total_cust,
                churned=churned_cust,
                retained=retained_cust,
                churn_rate=churn_pct,
                monthly_revenue=monthly_rev,
                monthly_revenue_at_risk=rev_at_risk,
                rate_diff_from_average=diff_from_avg
            ))

        # Sort descending by churn rate
        results.sort(key=lambda x: x.churn_rate, reverse=True)
        return results

    def get_monthly_charges_distribution(
        self,
        filter_contract: Optional[str] = None,
        filter_tenure_group: Optional[str] = None
    ) -> List[MonthlyChargeBand]:
        df = data_service.df.copy()
        if filter_contract and filter_contract != "all":
            df = df[df["Contract"] == filter_contract]
        if filter_tenure_group and filter_tenure_group != "all":
            df = df[df["tenure_group"] == filter_tenure_group]

        bins = [0, 30, 60, 90, 200]
        labels = ["<$30", "$30-60", "$60-90", "$90+"]
        df["charge_band"] = pd.cut(df["MonthlyCharges"], bins=bins, labels=labels, right=False)

        results = []
        for band in labels:
            sub = df[df["charge_band"] == band]
            c = len(sub)
            ch = int(sub["Churn"].sum())
            ret = c - ch
            rate = round(float(ch / c * 100), 1) if c > 0 else 0.0
            rev = round(float(sub["MonthlyCharges"].sum()), 2)
            results.append(MonthlyChargeBand(
                band=band,
                count=c,
                churned=ch,
                retained=ret,
                churn_rate=rate,
                monthly_revenue=rev
            ))
        return results

    def get_probability_histogram(
        self,
        filter_contract: Optional[str] = None,
        filter_tenure_group: Optional[str] = None
    ) -> List[HistogramBin]:
        df = data_service.df.copy()
        if filter_contract and filter_contract != "all":
            df = df[df["Contract"] == filter_contract]
        if filter_tenure_group and filter_tenure_group != "all":
            df = df[df["tenure_group"] == filter_tenure_group]

        bins = [i/10 for i in range(11)]
        labels = [f"{int(i*100)}-{int((i+0.1)*100)}%" for i in [j/10 for j in range(10)]]
        df["prob_bin"] = pd.cut(df["churn_probability"], bins=bins, labels=labels, include_lowest=True)

        results = []
        for b in labels:
            sub = df[df["prob_bin"] == b]
            c = len(sub)
            ch = int(sub["Churn"].sum())
            rate = round(float(ch / c * 100), 1) if c > 0 else 0.0
            results.append(HistogramBin(
                bin_range=b,
                count=c,
                churned=ch,
                churn_rate=rate
            ))
        return results

    def get_retention_funnel(
        self,
        filter_contract: Optional[str] = None,
        filter_tenure_group: Optional[str] = None
    ) -> List[FunnelStep]:
        df = data_service.df.copy()
        if filter_contract and filter_contract != "all":
            df = df[df["Contract"] == filter_contract]
        if filter_tenure_group and filter_tenure_group != "all":
            df = df[df["tenure_group"] == filter_tenure_group]

        total_customers = len(df)
        total_rev = float(df["MonthlyCharges"].sum()) if total_customers > 0 else 0.0

        # Step 1: All customers in active scope
        s1_count = total_customers
        s1_rev = total_rev

        # Step 2: High-risk accounts (Standardized risk_band == "High", prob > 0.70)
        high_risk_df = df[df["risk_band"] == "High"]
        s2_count = len(high_risk_df)
        s2_rev = float(high_risk_df["MonthlyCharges"].sum()) if s2_count > 0 else 0.0

        # Step 3: Priority Retention Cohort (Month-to-month High Risk)
        if filter_contract and filter_contract != "all" and filter_contract != "Month-to-month":
            m2m_hr_df = high_risk_df
        else:
            m2m_hr_df = high_risk_df[high_risk_df["Contract"] == "Month-to-month"]
        s3_count = len(m2m_hr_df)
        s3_rev = float(m2m_hr_df["MonthlyCharges"].sum()) if s3_count > 0 else 0.0

        # Step 4: Early Tenure High-Risk (0-12m M2M High Risk)
        early_hr_df = m2m_hr_df[m2m_hr_df["tenure"] <= 12]
        s4_count = len(early_hr_df)
        s4_rev = float(early_hr_df["MonthlyCharges"].sum()) if s4_count > 0 else 0.0

        return [
            FunnelStep(
                step_id="all_accounts",
                name="Accounts in Scope",
                description="Total verified customer population in active filter scope",
                count=s1_count,
                percentage_of_total=100.0 if total_customers > 0 else 0.0,
                monthly_revenue_exposure=round(s1_rev, 2)
            ),
            FunnelStep(
                step_id="high_risk",
                name="High-Risk Accounts",
                description="Scored >70% churn probability by model",
                count=s2_count,
                percentage_of_total=round(s2_count / total_customers * 100, 1) if total_customers > 0 else 0.0,
                monthly_revenue_exposure=round(s2_rev, 2)
            ),
            FunnelStep(
                step_id="m2m_high_risk",
                name="Month-to-Month High Risk",
                description="High risk accounts without contract commitment",
                count=s3_count,
                percentage_of_total=round(s3_count / total_customers * 100, 1) if total_customers > 0 else 0.0,
                monthly_revenue_exposure=round(s3_rev, 2)
            ),
            FunnelStep(
                step_id="early_tenure_high_risk",
                name="First-Year M2M High Risk",
                description="Early lifecycle accounts (tenure ≤ 12 mos) on monthly plans",
                count=s4_count,
                percentage_of_total=round(s4_count / total_customers * 100, 1) if total_customers > 0 else 0.0,
                monthly_revenue_exposure=round(s4_rev, 2)
            )
        ]

    def get_risk_distribution(
        self,
        filter_contract: Optional[str] = None,
        filter_tenure_group: Optional[str] = None
    ) -> List[RiskBandSummary]:
        df = data_service.df.copy()
        if filter_contract and filter_contract != "all":
            df = df[df["Contract"] == filter_contract]
        if filter_tenure_group and filter_tenure_group != "all":
            df = df[df["tenure_group"] == filter_tenure_group]

        total_customers = len(df)
        total_revenue = float(df["MonthlyCharges"].sum()) if total_customers > 0 else 0.0

        # Calibrated risk bands matching 03_train_model.py specification exactly:
        # Low: <= 0.40, Medium: 0.40 - 0.70, High: > 0.70
        bands_def = [
            ("Low", "≤ 0.40", df[df["risk_band"] == "Low"]),
            ("Medium", "0.40 – 0.70", df[df["risk_band"] == "Medium"]),
            ("High", "> 0.70", df[df["risk_band"] == "High"]),
        ]

        results = []
        for band_name, prob_range, band_df in bands_def:
            cust_count = len(band_df)
            churned = int(band_df["Churn"].sum()) if cust_count > 0 else 0
            churn_rate = round(float(churned / cust_count * 100), 1) if cust_count > 0 else 0.0
            rev_exposure = round(float(band_df["MonthlyCharges"].sum()), 2) if cust_count > 0 else 0.0
            cust_pct = round(float(cust_count / total_customers * 100), 1) if total_customers > 0 else 0.0
            rev_pct = round(float(rev_exposure / total_revenue * 100), 1) if total_revenue > 0 else 0.0

            results.append(RiskBandSummary(
                band=band_name,
                probability_range=prob_range,
                customers=cust_count,
                customer_pct=cust_pct,
                churned_in_band=churned,
                churn_rate_in_band=churn_rate,
                monthly_revenue_exposure=rev_exposure,
                revenue_pct=rev_pct
            ))

        return results

    def get_customers(
        self,
        search: Optional[str] = None,
        risk_band: Optional[str] = None,
        contract: Optional[str] = None,
        tenure_group: Optional[str] = None,
        internet_service: Optional[str] = None,
        payment_method: Optional[str] = None,
        actual_churn: Optional[int] = None,
        min_monthly_charges: Optional[float] = None,
        max_monthly_charges: Optional[float] = None,
        sort_by: str = "churn_probability",
        sort_desc: bool = True,
        page: int = 1,
        limit: int = 20
    ) -> CustomersResponse:
        df = data_service.df.copy()

        # Filtering
        if search:
            search_str = search.strip().upper()
            df = df[df["customerID"].str.upper().str.contains(search_str)]

        if risk_band and risk_band.lower() != "all":
            df = df[df["risk_band"].astype(str).str.lower() == risk_band.lower()]

        if contract and contract.lower() != "all":
            df = df[df["Contract"].str.lower() == contract.lower()]

        if tenure_group and tenure_group.lower() != "all":
            df = df[df["tenure_group"].str.lower() == tenure_group.lower()]

        if internet_service and internet_service.lower() != "all":
            df = df[df["InternetService"].str.lower() == internet_service.lower()]

        if payment_method and payment_method.lower() != "all":
            df = df[df["PaymentMethod"].str.lower() == payment_method.lower()]

        if actual_churn is not None and actual_churn != -1:
            df = df[df["Churn"] == actual_churn]

        if min_monthly_charges is not None:
            df = df[df["MonthlyCharges"] >= min_monthly_charges]

        if max_monthly_charges is not None:
            df = df[df["MonthlyCharges"] <= max_monthly_charges]

        total = len(df)

        # Sorting
        valid_sort_cols = {
            "customer_id": "customerID",
            "churn_probability": "churn_probability",
            "monthly_charges": "MonthlyCharges",
            "total_charges": "TotalCharges",
            "tenure": "tenure",
            "contract": "Contract",
            "risk_band": "risk_band"
        }
        col = valid_sort_cols.get(sort_by, "churn_probability")
        df = df.sort_values(by=col, ascending=not sort_desc)

        # Pagination
        limit = max(1, min(limit, 200))
        page = max(1, page)
        total_pages = math.ceil(total / limit) if total > 0 else 1
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_df = df.iloc[start_idx:end_idx]

        items = []
        for _, row in paginated_df.iterrows():
            items.append(self._row_to_customer_item(row))

        return CustomersResponse(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=total_pages
        )

    def get_customer_detail(self, customer_id: str) -> Optional[CustomerDetail]:
        df = data_service.df
        match = df[df["customerID"] == customer_id]
        if match.empty:
            return None

        row = match.iloc[0]
        base_item = self._row_to_customer_item(row)

        # Compute risk factors and protective factors
        risk_factors = []
        protective_factors = []

        if row["Contract"] == "Month-to-month":
            risk_factors.append("Month-to-month agreement: 42.7% segment churn rate vs 2.8% on two-year plans")
        else:
            protective_factors.append(f"{row['Contract']} contract provides baseline retention stability")

        if row["tenure"] <= 12:
            risk_factors.append(f"Early tenure ({row['tenure']} mos): first-year lifecycle hazard is 47.7%")
        elif row["tenure"] >= 36:
            protective_factors.append(f"Established customer loyalty ({row['tenure']} months of continuous service)")

        if row["PaymentMethod"] == "Electronic check":
            risk_factors.append("Electronic check billing: 45.3% segment churn rate (highest failure rate)")
        else:
            protective_factors.append(f"Automatic billing channel: {row['PaymentMethod']}")

        if row["InternetService"] == "Fiber optic":
            risk_factors.append("Fiber optic service with premium monthly charges ($70+/mo)")

        if row.get("OnlineSecurity") == "No":
            risk_factors.append("No online security add-on (reduces switching friction)")
        elif row.get("OnlineSecurity") == "Yes":
            protective_factors.append("Online security service add-on increases switching barrier")

        if row.get("TechSupport") == "No":
            risk_factors.append("No technical support tier attached to subscription")

        # Action recommendation (calibrated to standardized risk bands)
        if base_item.churn_probability > 0.70:
            if row["Contract"] == "Month-to-month":
                action = "Offer 1-year contract migration bundle with $15/month credit for 6 months."
            else:
                action = "Executive concierge check-in: review service satisfaction and audit fiber optic speeds."
        elif base_item.churn_probability > 0.40:
            if row["PaymentMethod"] == "Electronic check":
                action = "Incentivize switch to Auto-Pay with a one-time $10 bill credit."
            else:
                action = "Suggest service tier optimization or complementary Tech Support add-on."
        else:
            action = "Account in good standing; maintain standard relationship touchpoints."

        # Percentile of monthly charges
        charges_series = df["MonthlyCharges"]
        percentile = round(float((charges_series < row["MonthlyCharges"]).mean() * 100), 1)

        # Segment context
        seg_churn = float(df[df["Contract"] == row["Contract"]]["Churn"].mean() * 100)
        seg_context = f"{row['Contract']} customers historically have a {seg_churn:.1f}% churn rate."

        return CustomerDetail(
            **base_item.model_dump(),
            risk_factors=risk_factors,
            protective_factors=protective_factors,
            recommended_action=action,
            potential_saving_monthly=round(float(row["MonthlyCharges"]), 2),
            percentile_monthly_charges=percentile,
            segment_churn_context=seg_context
        )

    def calculate_retention_scenario(self, req: RetentionScenarioRequest) -> RetentionScenarioResponse:
        df = data_service.df.copy()

        # Determine target segment (calibrated to standardized 0.70 high-risk threshold)
        if req.target_segment == "month_to_month_high_risk":
            seg_name = "Month-to-Month High-Risk (Prob > 70%)"
            subset = df[(df["Contract"] == "Month-to-month") & (df["churn_probability"] > 0.70)]
        elif req.target_segment == "first_year_high_risk":
            seg_name = "First-Year High-Risk (Tenure ≤ 12m & Prob > 70%)"
            subset = df[(df["tenure"] <= 12) & (df["churn_probability"] > 0.70)]
        elif req.target_segment == "high_charge_high_risk":
            seg_name = "High-Charges High-Risk (MonthlyCharges ≥ $70 & Prob > 70%)"
            subset = df[(df["MonthlyCharges"] >= 70.0) & (df["churn_probability"] > 0.70)]
        elif req.target_segment == "all_high_risk":
            seg_name = "All High-Risk Accounts (Prob > 70%)"
            subset = df[df["churn_probability"] > 0.70]
        else:
            seg_name = "Custom Segment"
            p_min = req.custom_min_probability or 0.70
            subset = df[df["churn_probability"] >= p_min]
            if req.custom_contract and req.custom_contract != "all":
                subset = subset[subset["Contract"] == req.custom_contract]
            if req.custom_max_tenure is not None:
                subset = subset[subset["tenure"] <= req.custom_max_tenure]

        eligible_count = len(subset)
        if eligible_count == 0:
            return RetentionScenarioResponse(
                target_segment_name=seg_name,
                eligible_customers=0,
                targeted_customers=0,
                average_monthly_charges=0.0,
                total_monthly_revenue_exposure=0.0,
                total_campaign_cost=0.0,
                assumed_retained_customers=0,
                estimated_monthly_revenue_protected=0.0,
                estimated_net_benefit=0.0,
                break_even_success_rate=0.0,
                break_even_customers_needed=0,
                roi_multiple=0.0,
                assumptions_note="No customers match the selected criteria."
            )

        # If user specified a customer volume cap, sort by highest probability first
        subset = subset.sort_values(by="churn_probability", ascending=False)
        if req.target_customer_limit and req.target_customer_limit < eligible_count:
            targeted_df = subset.iloc[:req.target_customer_limit]
        else:
            targeted_df = subset

        targeted_count = len(targeted_df)
        avg_charge = round(float(targeted_df["MonthlyCharges"].mean()), 2)
        total_exposure = round(float(targeted_df["MonthlyCharges"].sum()), 2)

        # Economics calculations
        offer_cost = req.offer_cost_per_customer
        success_rate = req.assumed_success_rate

        total_campaign_cost = round(targeted_count * offer_cost, 2)
        assumed_retained = int(round(targeted_count * success_rate))
        estimated_protected_revenue = round(assumed_retained * avg_charge, 2)
        net_benefit = round(estimated_protected_revenue - total_campaign_cost, 2)

        # Break-even success rate: campaign_cost / total_exposure
        if total_exposure > 0:
            be_rate = round(float(total_campaign_cost / total_exposure), 4)
        else:
            be_rate = 0.0

        if avg_charge > 0:
            be_customers = math.ceil(total_campaign_cost / avg_charge)
        else:
            be_customers = 0

        roi = round(float(estimated_protected_revenue / total_campaign_cost), 2) if total_campaign_cost > 0 else 0.0

        note = (
            f"Assumes an offer cost of ${offer_cost:.2f} per targeted customer and a {success_rate * 100:.1f}% "
            f"retention conversion rate. Monthly revenue exposure reflects the monthly billing amount. "
            f"Break-even requires retaining at least {be_customers:,} customers ({be_rate * 100:.1f}% success rate)."
        )

        return RetentionScenarioResponse(
            target_segment_name=seg_name,
            eligible_customers=eligible_count,
            targeted_customers=targeted_count,
            average_monthly_charges=avg_charge,
            total_monthly_revenue_exposure=total_exposure,
            total_campaign_cost=total_campaign_cost,
            assumed_retained_customers=assumed_retained,
            estimated_monthly_revenue_protected=estimated_protected_revenue,
            estimated_net_benefit=net_benefit,
            break_even_success_rate=round(be_rate * 100, 2),
            break_even_customers_needed=be_customers,
            roi_multiple=roi,
            assumptions_note=note
        )

    def _row_to_customer_item(self, row: pd.Series) -> CustomerItem:
        return CustomerItem(
            customer_id=str(row["customerID"]),
            gender=str(row.get("gender", "Unknown")),
            senior_citizen=int(row.get("SeniorCitizen", 0)),
            partner=str(row.get("Partner", "No")),
            dependents=str(row.get("Dependents", "No")),
            tenure=int(row["tenure"]),
            tenure_group=str(row.get("tenure_group", "Unknown")),
            phone_service=str(row.get("PhoneService", "No")),
            multiple_lines=str(row.get("MultipleLines", "No")),
            internet_service=str(row.get("InternetService", "No")),
            online_security=str(row.get("OnlineSecurity", "No")),
            online_backup=str(row.get("OnlineBackup", "No")),
            device_protection=str(row.get("DeviceProtection", "No")),
            tech_support=str(row.get("TechSupport", "No")),
            streaming_tv=str(row.get("StreamingTV", "No")),
            streaming_movies=str(row.get("StreamingMovies", "No")),
            contract=str(row.get("Contract", "Month-to-month")),
            paperless_billing=str(row.get("PaperlessBilling", "No")),
            payment_method=str(row.get("PaymentMethod", "Unknown")),
            monthly_charges=round(float(row["MonthlyCharges"]), 2),
            total_charges=round(float(row["TotalCharges"]), 2),
            actual_churn=int(row["Churn"]),
            churn_probability=round(float(row["churn_probability"]), 4),
            risk_band=str(row.get("risk_band", "Medium"))
        )

analytics_service = AnalyticsService()
