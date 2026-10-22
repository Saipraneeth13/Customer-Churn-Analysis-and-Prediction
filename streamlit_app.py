"""
RETAINIQ — Customer Churn Analytics Command Center
Streamlit Community Cloud Entrypoint

Tagline: Understand churn. Predict risk. Protect revenue.
Design Tokens:
- Background: #0B0D14
- Sidebar: #10131D
- Cards: #171B27
- Borders: #292F40
- Text: #F3F5FA (primary), #9299AD (secondary)
- Accents: Electric Violet #8B7CFF, Cyan #55D9E8, Mint #5DE2B1, Amber #FFBE69, Coral #FF6B78
"""

import sys
from pathlib import Path
from typing import Optional, List, Dict, Any
import math
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

# ---------------------------------------------------------------------------
# Path & Service Integration
# ---------------------------------------------------------------------------
ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.data_service import data_service
from app.services.analytics_service import analytics_service
from app.services.ml_service import ml_service
from app.schemas import RetentionScenarioRequest

# ---------------------------------------------------------------------------
# Streamlit Page Configuration
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="RETAINIQ — Customer Churn Analytics",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ---------------------------------------------------------------------------
# Custom CSS for Dark Enterprise Analytics Aesthetic
# ---------------------------------------------------------------------------
CUSTOM_CSS = """
<style>
/* Main app backgrounds */
.stApp {
    background-color: #0B0D14;
    color: #F3F5FA;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

[data-testid="stSidebar"] {
    background-color: #10131D;
    border-right: 1px solid #292F40;
}

/* Card surfaces */
.retainiq-card {
    background-color: #171B27;
    border: 1px solid #292F40;
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 16px;
    transition: border-color 0.15s ease-in-out;
}
.retainiq-card:hover {
    border-color: #8B7CFF44;
}

/* Metric card */
.kpi-card {
    background-color: #171B27;
    border: 1px solid #292F40;
    border-radius: 8px;
    padding: 14px 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 105px;
}
.kpi-label {
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #9299AD;
    margin-bottom: 4px;
}
.kpi-value {
    font-size: 1.55rem;
    font-weight: 700;
    color: #F3F5FA;
    letter-spacing: -0.02em;
    line-height: 1.2;
}
.kpi-subtext {
    font-size: 0.75rem;
    color: #9299AD;
    margin-top: 6px;
}

/* Badges */
.badge-pill {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}
.badge-low {
    background-color: #5DE2B122;
    color: #5DE2B1;
    border: 1px solid #5DE2B155;
}
.badge-med {
    background-color: #FFBE6922;
    color: #FFBE69;
    border: 1px solid #FFBE6955;
}
.badge-high {
    background-color: #FF6B7822;
    color: #FF6B78;
    border: 1px solid #FF6B7855;
}
.badge-violet {
    background-color: #8B7CFF22;
    color: #8B7CFF;
    border: 1px solid #8B7CFF55;
}

/* Funnel step */
.funnel-step-box {
    background-color: #171B27;
    border-left: 3px solid #8B7CFF;
    border-top: 1px solid #292F40;
    border-right: 1px solid #292F40;
    border-bottom: 1px solid #292F40;
    border-radius: 0 8px 8px 0;
    padding: 12px 16px;
    margin-bottom: 10px;
}

/* Signal card */
.signal-box {
    background-color: #171B27;
    border: 1px solid #292F40;
    border-radius: 8px;
    padding: 14px 16px;
    margin-bottom: 12px;
}

/* Tabs styling */
.stTabs [data-baseweb="tab-list"] {
    background-color: #10131D;
    border-radius: 8px;
    padding: 4px;
    gap: 6px;
    border: 1px solid #292F40;
}
.stTabs [data-baseweb="tab"] {
    color: #9299AD;
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 600;
    font-size: 0.85rem;
}
.stTabs [aria-selected="true"] {
    background-color: #1C2130 !important;
    color: #F3F5FA !important;
    border-bottom: 2px solid #8B7CFF !important;
}

/* Inputs and Selects */
div[data-baseweb="select"] > div {
    background-color: #171B27;
    border-color: #292F40;
    color: #F3F5FA;
}

/* Streamlit data table */
[data-testid="stDataFrame"] {
    border: 1px solid #292F40;
    border-radius: 8px;
    overflow: hidden;
}
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

# ---------------------------------------------------------------------------
# Data Load Validation
# ---------------------------------------------------------------------------
@st.cache_data(show_spinner=False)
def load_cached_dataset() -> pd.DataFrame:
    """Load and cache the customer population using DataService."""
    return data_service.df.copy()

df_raw = load_cached_dataset()

# ---------------------------------------------------------------------------
# Sidebar & Filters
# ---------------------------------------------------------------------------
with st.sidebar:
    st.markdown("""
    <div style="display:flex; align-items:center; gap:10px; margin-bottom: 12px;">
        <span style="font-size:1.6rem; color:#8B7CFF; font-weight:800;">⚡</span>
        <div>
            <div style="font-size:1.25rem; font-weight:800; letter-spacing:-0.03em; color:#F3F5FA;">RETAINIQ</div>
            <div style="font-size:0.68rem; color:#9299AD; text-transform:uppercase; letter-spacing:0.06em;">Churn Intelligence</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<p style='font-size:0.78rem; color:#9299AD; margin-bottom:16px;'>Understand churn. Predict risk. Protect revenue.</p>", unsafe_allow_html=True)
    st.markdown("---")

    st.markdown("<div style='font-size:0.75rem; font-weight:700; color:#8B7CFF; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:8px;'>Scope Filters</div>", unsafe_allow_html=True)

    contract_options = ["All Contracts", "Month-to-month", "One year", "Two year"]
    selected_contract = st.selectbox("Contract Type", contract_options, index=0)
    filter_contract = None if selected_contract == "All Contracts" else selected_contract

    tenure_options = ["All Tenures", "0-12 months", "13-24 months", "25-48 months", "49+ months"]
    selected_tenure = st.selectbox("Tenure Group", tenure_options, index=0)
    filter_tenure = None if selected_tenure == "All Tenures" else selected_tenure

    st.markdown("---")

    # Scope Summary Pill
    kpis_active = analytics_service.get_kpis(
        filter_contract=filter_contract,
        filter_tenure_group=filter_tenure
    )

    st.markdown(f"""
    <div style='background-color:#171B27; border:1px solid #292F40; border-radius:6px; padding:10px 12px; margin-bottom:14px;'>
        <div style='font-size:0.68rem; color:#9299AD; text-transform:uppercase;'>Active Population Scope</div>
        <div style='font-size:1.05rem; font-weight:700; color:#55D9E8; margin-top:2px;'>{kpis_active.total_customers:,} Accounts</div>
        <div style='font-size:0.72rem; color:#9299AD; margin-top:4px;'>
            {selected_contract} • {selected_tenure}
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div style='font-size:0.72rem; color:#9299AD; margin-top:24px;'>
        <div><b>Model AUC:</b> 0.835 (Held-out Test)</div>
        <div><b>Data Source:</b> Processed Clean Dataset</div>
        <div style='margin-top:8px;'><b>Risk Thresholds:</b></div>
        <div style='display:flex; gap:6px; margin-top:4px;'>
            <span class='badge-pill badge-low'>Low ≤40%</span>
            <span class='badge-pill badge-med'>Med 40-70%</span>
            <span class='badge-pill badge-high'>High >70%</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

# ---------------------------------------------------------------------------
# Header Section
# ---------------------------------------------------------------------------
header_col1, header_col2 = st.columns([3, 1])

with header_col1:
    st.markdown(f"""
    <div style="display:flex; align-items:baseline; gap:12px;">
        <h1 style="margin:0; font-size:1.8rem; font-weight:800; letter-spacing:-0.03em; color:#F3F5FA;">
            Customer Churn Command Center
        </h1>
        <span class="badge-pill badge-violet" style="font-size:0.75rem;">Enterprise Analytics</span>
    </div>
    <p style="margin:4px 0 16px 0; font-size:0.85rem; color:#9299AD;">
        Real-time risk scoring, predictive segmentation, and revenue exposure across {kpis_active.total_customers:,} accounts.
    </p>
    """, unsafe_allow_html=True)

with header_col2:
    pulse_color = "#5DE2B1" if kpis_active.retention_pulse_status == "healthy" else ("#FFBE69" if kpis_active.retention_pulse_status == "warning" else "#FF6B78")
    st.markdown(f"""
    <div style="text-align:right; margin-top:4px;">
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:{pulse_color}; margin-right:6px;"></span>
        <span style="font-size:0.82rem; font-weight:600; color:{pulse_color};">{kpis_active.retention_pulse}</span>
        <div style="font-size:0.72rem; color:#9299AD; margin-top:2px;">Last data audit: {data_service.last_loaded}</div>
    </div>
    """, unsafe_allow_html=True)

# ---------------------------------------------------------------------------
# KPI Cards Row (6 Horizontal Metrics Cards)
# ---------------------------------------------------------------------------
kpi_cols = st.columns(6)

with kpi_cols[0]:
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-label">Accounts in Scope</div>
        <div class="kpi-value">{kpis_active.total_customers:,}</div>
        <div class="kpi-subtext">Verified customer cohort</div>
    </div>
    """, unsafe_allow_html=True)

with kpi_cols[1]:
    churn_color = "#FF6B78" if kpis_active.overall_churn_rate > 30 else ("#FFBE69" if kpis_active.overall_churn_rate > 20 else "#5DE2B1")
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-label">Overall Churn Rate</div>
        <div class="kpi-value" style="color:{churn_color};">{kpis_active.overall_churn_rate:.2f}%</div>
        <div class="kpi-subtext">{kpis_active.churned_customers:,} churned / {kpis_active.retained_customers:,} active</div>
    </div>
    """, unsafe_allow_html=True)

with kpi_cols[2]:
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-label">Monthly Billing (MRR)</div>
        <div class="kpi-value">${kpis_active.total_monthly_revenue:,.0f}</div>
        <div class="kpi-subtext">Active recurring monthly rev</div>
    </div>
    """, unsafe_allow_html=True)

with kpi_cols[3]:
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-label">High-Risk Exposure</div>
        <div class="kpi-value" style="color:#FF6B78;">${kpis_active.high_risk_revenue_exposure:,.0f}</div>
        <div class="kpi-subtext">{kpis_active.monthly_revenue_at_risk_pct:.1f}% of cohort MRR</div>
    </div>
    """, unsafe_allow_html=True)

with kpi_cols[4]:
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-label">High-Risk Customers</div>
        <div class="kpi-value" style="color:#FF6B78;">{kpis_active.high_risk_customers:,}</div>
        <div class="kpi-subtext">Scored > 70% probability</div>
    </div>
    """, unsafe_allow_html=True)

with kpi_cols[5]:
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-label">Model ROC-AUC</div>
        <div class="kpi-value" style="color:#8B7CFF;">{kpis_active.model_roc_auc:.3f}</div>
        <div class="kpi-subtext">Random Forest & LR benchmark</div>
    </div>
    """, unsafe_allow_html=True)

st.markdown("<div style='height:16px;'></div>", unsafe_allow_html=True)

# ---------------------------------------------------------------------------
# Navigation Tabs
# ---------------------------------------------------------------------------
tab_overview, tab_explorer, tab_simulator, tab_model = st.tabs([
    "📊 Executive Dashboard",
    "🔍 Customer Risk Explorer",
    "🎯 Retention ROI Simulator",
    "🤖 Model Intelligence & Audits"
])

# ===========================================================================
# TAB 1: EXECUTIVE DASHBOARD
# ===========================================================================
with tab_overview:
    # Row 1: Charts (Donut Churn Status & Risk Band Distribution vs Funnel)
    row1_col1, row1_col2 = st.columns([1, 1])

    with row1_col1:
        st.markdown("""
        <div class="retainiq-card">
            <div style="font-size:0.95rem; font-weight:700; color:#F3F5FA; margin-bottom:2px;">
                Customer Risk & Retention Profile
            </div>
            <div style="font-size:0.75rem; color:#9299AD; margin-bottom:12px;">
                Standardized risk bands (Low ≤ 0.40, Medium 0.40–0.70, High > 0.70)
            </div>
        """, unsafe_allow_html=True)

        risk_bands = analytics_service.get_risk_distribution(
            filter_contract=filter_contract,
            filter_tenure_group=filter_tenure
        )

        band_df = pd.DataFrame([
            {
                "Risk Band": f"{b.band} ({b.probability_range})",
                "Accounts": b.customers,
                "MRR Exposure": b.monthly_revenue_exposure,
                "Churn Rate (%)": b.churn_rate_in_band
            }
            for b in risk_bands
        ])

        fig_donut = go.Figure(data=[go.Pie(
            labels=band_df["Risk Band"],
            values=band_df["Accounts"],
            hole=0.62,
            marker=dict(colors=["#5DE2B1", "#FFBE69", "#FF6B78"]),
            textinfo="label+percent",
            hoverinfo="label+value+percent",
            textfont=dict(color="#F3F5FA", size=12)
        )])
        fig_donut.update_layout(
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            margin=dict(t=10, b=10, l=10, r=10),
            height=260,
            showlegend=False
        )
        st.plotly_chart(fig_donut, use_container_width=True)

        # Risk band summary table
        cols_b = st.columns(3)
        for idx, b in enumerate(risk_bands):
            b_color = "#5DE2B1" if b.band == "Low" else ("#FFBE69" if b.band == "Medium" else "#FF6B78")
            with cols_b[idx]:
                st.markdown(f"""
                <div style="text-align:center; padding:8px; background-color:#10131D; border-radius:6px; border:1px solid #292F40;">
                    <div style="font-size:0.7rem; font-weight:700; color:{b_color};">{b.band} Risk</div>
                    <div style="font-size:1.1rem; font-weight:700; color:#F3F5FA; margin-top:2px;">{b.customers:,}</div>
                    <div style="font-size:0.7rem; color:#9299AD;">${b.monthly_revenue_exposure:,.0f}/mo • {b.churn_rate_in_band:.1f}% churn</div>
                </div>
                """, unsafe_allow_html=True)

        st.markdown("</div>", unsafe_allow_html=True)

    with row1_col2:
        st.markdown("""
        <div class="retainiq-card">
            <div style="font-size:0.95rem; font-weight:700; color:#F3F5FA; margin-bottom:2px;">
                Retention Funnel & Vulnerability Cascade
            </div>
            <div style="font-size:0.75rem; color:#9299AD; margin-bottom:12px;">
                Sequential concentration from full population down to highest hazard segment
            </div>
        """, unsafe_allow_html=True)

        funnel_steps = analytics_service.get_retention_funnel(
            filter_contract=filter_contract,
            filter_tenure_group=filter_tenure
        )

        for step in funnel_steps:
            st.markdown(f"""
            <div class="funnel-step-box">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <span style="font-size:0.85rem; font-weight:700; color:#F3F5FA;">{step.name}</span>
                        <div style="font-size:0.72rem; color:#9299AD;">{step.description}</div>
                    </div>
                    <div style="text-align:right;">
                        <span style="font-size:1.05rem; font-weight:700; color:#55D9E8;">{step.count:,}</span>
                        <span style="font-size:0.75rem; color:#9299AD; margin-left:4px;">({step.percentage_of_total:.1f}%)</span>
                        <div style="font-size:0.72rem; color:#FFBE69;">${step.monthly_revenue_exposure:,.0f} MRR</div>
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)

        st.markdown("</div>", unsafe_allow_html=True)

    # Row 2: Driver Breakdown Tabs & Signals Worth Watching
    row2_col1, row2_col2 = st.columns([1, 1])

    with row2_col1:
        st.markdown("""
        <div class="retainiq-card">
            <div style="font-size:0.95rem; font-weight:700; color:#F3F5FA; margin-bottom:2px;">
                Behavioral & Service Churn Drivers
            </div>
            <div style="font-size:0.75rem; color:#9299AD; margin-bottom:12px;">
                Churn rate and revenue exposure broken down by service category
            </div>
        """, unsafe_allow_html=True)

        driver_tab1, driver_tab2, driver_tab3, driver_tab4 = st.tabs([
            "Contract", "Internet Service", "Payment Method", "Tech Support"
        ])

        categories = [
            ("Contract", driver_tab1),
            ("InternetService", driver_tab2),
            ("PaymentMethod", driver_tab3),
            ("TechSupport", driver_tab4)
        ]

        for col_name, tab_target in categories:
            with tab_target:
                metrics = analytics_service.get_segment_metrics(
                    column=col_name,
                    filter_contract=filter_contract,
                    filter_tenure_group=filter_tenure
                )
                if metrics:
                    m_df = pd.DataFrame([
                        {
                            "Segment": m.segment_name,
                            "Accounts": m.customers,
                            "Churn Rate (%)": m.churn_rate,
                            "Monthly Revenue": m.monthly_revenue,
                            "MRR at Risk": m.monthly_revenue_at_risk
                        }
                        for m in metrics
                    ])

                    fig_bar = px.bar(
                        m_df,
                        x="Segment",
                        y="Churn Rate (%)",
                        color="Churn Rate (%)",
                        color_continuous_scale=["#5DE2B1", "#FFBE69", "#FF6B78"],
                        text="Churn Rate (%)",
                        hover_data=["Accounts", "Monthly Revenue", "MRR at Risk"]
                    )
                    fig_bar.update_traces(texttemplate="%{text:.1f}%", textposition="outside")
                    fig_bar.update_layout(
                        paper_bgcolor="rgba(0,0,0,0)",
                        plot_bgcolor="rgba(0,0,0,0)",
                        coloraxis_showscale=False,
                        margin=dict(t=20, b=10, l=10, r=10),
                        height=240,
                        yaxis=dict(showgrid=True, gridcolor="#292F40", title=""),
                        xaxis=dict(title="")
                    )
                    st.plotly_chart(fig_bar, use_container_width=True)

                    st.dataframe(
                        m_df,
                        use_container_width=True,
                        hide_index=True,
                        column_config={
                            "Monthly Revenue": st.column_config.NumberColumn(format="$%.2f"),
                            "MRR at Risk": st.column_config.NumberColumn(format="$%.2f"),
                            "Churn Rate (%)": st.column_config.NumberColumn(format="%.1f%%")
                        }
                    )
                else:
                    st.info("No data available for this segment in active scope.")

        st.markdown("</div>", unsafe_allow_html=True)

    with row2_col2:
        st.markdown("""
        <div class="retainiq-card">
            <div style="font-size:0.95rem; font-weight:700; color:#F3F5FA; margin-bottom:2px;">
                Signals Worth Watching
            </div>
            <div style="font-size:0.75rem; color:#9299AD; margin-bottom:12px;">
                Empirically validated structural insights and leverage points
            </div>
        """, unsafe_allow_html=True)

        insights = analytics_service.get_insights()
        for ins in insights:
            st.markdown(f"""
            <div class="signal-box">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <span style="font-size:0.85rem; font-weight:700; color:#F3F5FA;">{ins.title}</span>
                    <span class="badge-pill badge-violet">{ins.impact}</span>
                </div>
                <div style="font-size:0.75rem; color:#9299AD; margin-bottom:6px;">
                    {ins.description}
                </div>
                <div style="font-size:0.72rem; color:#8B7CFF;">
                    <b>Action:</b> {ins.business_relevance}
                </div>
            </div>
            """, unsafe_allow_html=True)

        st.markdown("</div>", unsafe_allow_html=True)

# ===========================================================================
# TAB 2: CUSTOMER RISK EXPLORER
# ===========================================================================
with tab_explorer:
    st.markdown("""
    <div style="margin-bottom:12px;">
        <span style="font-size:1.1rem; font-weight:700; color:#F3F5FA;">Customer Account Risk Explorer</span>
        <p style="font-size:0.8rem; color:#9299AD; margin:2px 0 0 0;">
            Search accounts, inspect calibrated churn probabilities, evaluate risk drivers, and export data.
        </p>
    </div>
    """, unsafe_allow_html=True)

    filter_exp_c1, filter_exp_c2, filter_exp_c3, filter_exp_c4 = st.columns([2, 1.2, 1.2, 1])

    with filter_exp_c1:
        search_query = st.text_input("Search Customer ID", placeholder="e.g. 7590-VHVEG", key="search_cust_id")

    with filter_exp_c2:
        risk_filter_options = ["All", "High", "Medium", "Low"]
        selected_risk_filter = st.selectbox("Risk Band", risk_filter_options, index=0)

    with filter_exp_c3:
        sort_options = [
            ("churn_probability", "Highest Probability"),
            ("monthly_charges", "Highest Monthly Charges"),
            ("total_charges", "Highest Total Charges"),
            ("tenure", "Shortest Tenure")
        ]
        selected_sort_label = st.selectbox("Sort By", [s[1] for s in sort_options], index=0)
        selected_sort_field = next(s[0] for s in sort_options if s[1] == selected_sort_label)

    with filter_exp_c4:
        page_size = st.selectbox("Page Size", [20, 50, 100], index=0)

    # Fetch matching customers using analytics service
    cust_response = analytics_service.get_customers(
        search=search_query if search_query else None,
        risk_band=selected_risk_filter if selected_risk_filter != "All" else None,
        contract=filter_contract,
        tenure_group=filter_tenure,
        sort_by=selected_sort_field,
        sort_desc=(selected_sort_field != "tenure"),
        page=1,
        limit=page_size
    )

    st.markdown(f"<div style='font-size:0.75rem; color:#9299AD; margin-bottom:8px;'>Showing top {len(cust_response.items):,} of {cust_response.total:,} matching accounts</div>", unsafe_allow_html=True)

    if cust_response.items:
        table_records = [
            {
                "Customer ID": item.customer_id,
                "Risk Band": item.risk_band,
                "Churn Prob": f"{item.churn_probability * 100:.1f}%",
                "Contract": item.contract,
                "Tenure": f"{item.tenure} mos",
                "Internet": item.internet_service,
                "Payment Method": item.payment_method,
                "Monthly Charges": item.monthly_charges,
                "Total Charges": item.total_charges,
                "Actual Churn": "Churned" if item.actual_churn == 1 else "Retained"
            }
            for item in cust_response.items
        ]
        cust_table_df = pd.DataFrame(table_records)

        st.dataframe(
            cust_table_df,
            use_container_width=True,
            hide_index=True,
            column_config={
                "Monthly Charges": st.column_config.NumberColumn(format="$%.2f"),
                "Total Charges": st.column_config.NumberColumn(format="$%.2f")
            }
        )

        # Download button for filtered customer dataset
        export_df = df_raw.copy()
        if filter_contract:
            export_df = export_df[export_df["Contract"] == filter_contract]
        if filter_tenure:
            export_df = export_df[export_df["tenure_group"] == filter_tenure]
        if selected_risk_filter != "All":
            export_df = export_df[export_df["risk_band"] == selected_risk_filter]
        if search_query:
            export_df = export_df[export_df["customerID"].str.contains(search_query.strip().upper())]

        csv_data = export_df.to_csv(index=False).encode("utf-8")
        st.download_button(
            label=f"📥 Export Filtered Accounts ({len(export_df):,} records as CSV)",
            data=csv_data,
            file_name="retainiq_filtered_customers.csv",
            mime="text/csv"
        )

        st.markdown("---")

        # Detailed Customer Deep Dive Inspector
        st.markdown("<div style='font-size:0.95rem; font-weight:700; color:#F3F5FA; margin-bottom:8px;'>Account Detail & Retention Action Inspector</div>", unsafe_allow_html=True)
        customer_id_list = [item.customer_id for item in cust_response.items]
        selected_inspect_id = st.selectbox("Select Account to Inspect", customer_id_list, index=0)

        detail = analytics_service.get_customer_detail(selected_inspect_id)
        if detail:
            d_col1, d_col2 = st.columns([1, 1])

            with d_col1:
                st.markdown(f"""
                <div class="retainiq-card">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:1.1rem; font-weight:700; color:#F3F5FA;">{detail.customer_id}</span>
                        <span class="badge-pill {'badge-high' if detail.risk_band == 'High' else ('badge-med' if detail.risk_band == 'Medium' else 'badge-low')}">
                            {detail.risk_band} Risk ({detail.churn_probability * 100:.1f}%)
                        </span>
                    </div>
                    <div style="font-size:0.75rem; color:#9299AD; margin-top:6px;">
                        Monthly Charges: <b>${detail.monthly_charges:.2f}</b> ({detail.percentile_monthly_charges}th percentile) • Total: <b>${detail.total_charges:.2f}</b>
                    </div>
                    <div style="font-size:0.75rem; color:#9299AD; margin-top:2px;">
                        Contract: <b>{detail.contract}</b> • Tenure: <b>{detail.tenure} months</b> • Billing: <b>{detail.payment_method}</b>
                    </div>
                    <div style="margin-top:14px; padding:10px 12px; background-color:#10131D; border-radius:6px; border:1px solid #8B7CFF44;">
                        <div style="font-size:0.7rem; font-weight:700; color:#8B7CFF; text-transform:uppercase;">Recommended Intervention Action</div>
                        <div style="font-size:0.8rem; color:#F3F5FA; margin-top:3px;">{detail.recommended_action}</div>
                    </div>
                </div>
                """, unsafe_allow_html=True)

            with d_col2:
                st.markdown("""
                <div class="retainiq-card">
                    <div style="font-size:0.85rem; font-weight:700; color:#F3F5FA; margin-bottom:8px;">
                        Risk Factors vs. Protective Signals
                    </div>
                """, unsafe_allow_html=True)

                if detail.risk_factors:
                    st.markdown("<div style='font-size:0.72rem; font-weight:700; color:#FF6B78; text-transform:uppercase;'>Vulnerability Drivers</div>", unsafe_allow_html=True)
                    for rf in detail.risk_factors:
                        st.markdown(f"<div style='font-size:0.78rem; color:#F3F5FA; margin:2px 0;'>⚠️ {rf}</div>", unsafe_allow_html=True)

                if detail.protective_factors:
                    st.markdown("<div style='font-size:0.72rem; font-weight:700; color:#5DE2B1; text-transform:uppercase; margin-top:8px;'>Retention Stabilizers</div>", unsafe_allow_html=True)
                    for pf in detail.protective_factors:
                        st.markdown(f"<div style='font-size:0.78rem; color:#F3F5FA; margin:2px 0;'>🛡️ {pf}</div>", unsafe_allow_html=True)

                st.markdown("</div>", unsafe_allow_html=True)

    else:
        st.info("No customers found matching the search and filter criteria.")

# ===========================================================================
# TAB 3: RETENTION ROI SIMULATOR
# ===========================================================================
with tab_simulator:
    st.markdown("""
    <div style="margin-bottom:12px;">
        <span style="font-size:1.1rem; font-weight:700; color:#F3F5FA;">Interactive Retention ROI Simulator</span>
        <p style="font-size:0.8rem; color:#9299AD; margin:2px 0 0 0;">
            Simulate campaign economics, required break-even success rates, and projected revenue protection.
        </p>
    </div>
    """, unsafe_allow_html=True)

    sim_col1, sim_col2 = st.columns([1.2, 2])

    with sim_col1:
        st.markdown("<div class='retainiq-card'>", unsafe_allow_html=True)
        st.markdown("<div style='font-size:0.85rem; font-weight:700; color:#8B7CFF; text-transform:uppercase; margin-bottom:8px;'>Campaign Parameters</div>", unsafe_allow_html=True)

        target_cohort = st.selectbox(
            "Target Cohort",
            [
                ("month_to_month_high_risk", "Month-to-Month High Risk (Prob > 70%)"),
                ("first_year_high_risk", "First-Year High Risk (Tenure ≤ 12m & Prob > 70%)"),
                ("high_charge_high_risk", "High Monthly Charges (≥ $70 & Prob > 70%)"),
                ("all_high_risk", "All Scored High Risk (Prob > 70%)")
            ],
            format_func=lambda x: x[1]
        )[0]

        offer_cost = st.slider("Offer / Incentive Cost per Customer ($)", min_value=5.0, max_value=100.0, value=30.0, step=5.0)
        success_rate_pct = st.slider("Assumed Retention Conversion Rate (%)", min_value=5, max_value=60, value=25, step=5)
        volume_limit = st.slider("Max Customers to Target (Cap)", min_value=100, max_value=3000, value=1000, step=100)

        st.markdown("</div>", unsafe_allow_html=True)

    with sim_col2:
        # Run calculation using backend analytics service
        sim_request = RetentionScenarioRequest(
            target_segment=target_cohort,
            offer_cost_per_customer=offer_cost,
            assumed_success_rate=success_rate_pct / 100.0,
            target_customer_limit=volume_limit
        )
        sim_res = analytics_service.calculate_retention_scenario(sim_request)

        st.markdown("<div class='retainiq-card'>", unsafe_allow_html=True)
        st.markdown(f"<div style='font-size:0.95rem; font-weight:700; color:#F3F5FA; margin-bottom:4px;'>Projected Economics: {sim_res.target_segment_name}</div>", unsafe_allow_html=True)
        st.markdown(f"<div style='font-size:0.75rem; color:#9299AD; margin-bottom:14px;'>Targeting {sim_res.targeted_customers:,} of {sim_res.eligible_customers:,} eligible accounts</div>", unsafe_allow_html=True)

        res_cols = st.columns(4)
        with res_cols[0]:
            st.metric("Campaign Cost", f"${sim_res.total_campaign_cost:,.0f}")
        with res_cols[1]:
            st.metric("Retained Accounts", f"{sim_res.assumed_retained_customers:,}")
        with res_cols[2]:
            st.metric("Protected Monthly MRR", f"${sim_res.estimated_monthly_revenue_protected:,.0f}")
        with res_cols[3]:
            benefit_color = "#5DE2B1" if sim_res.estimated_net_benefit >= 0 else "#FF6B78"
            st.metric("Estimated Net Benefit", f"${sim_res.estimated_net_benefit:,.0f}", delta=f"{sim_res.roi_multiple:.1f}x ROI")

        st.markdown("---")

        st.markdown(f"""
        <div style="background-color:#10131D; border-radius:6px; border:1px solid #292F40; padding:12px; font-size:0.78rem; color:#9299AD;">
            <div><b>Break-Even Analysis:</b> Requires retaining at least <b>{sim_res.break_even_customers_needed:,} customers</b> ({sim_res.break_even_success_rate:.1f}% success rate) to fully offset the ${sim_res.total_campaign_cost:,.0f} campaign cost.</div>
            <div style="margin-top:6px; color:#F3F5FA;">{sim_res.assumptions_note}</div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("</div>", unsafe_allow_html=True)

# ===========================================================================
# TAB 4: MODEL INTELLIGENCE & AUDITS
# ===========================================================================
with tab_model:
    st.markdown("""
    <div style="margin-bottom:12px;">
        <span style="font-size:1.1rem; font-weight:700; color:#F3F5FA;">Machine Learning Model Performance & Benchmark Audit</span>
        <p style="font-size:0.8rem; color:#9299AD; margin:2px 0 0 0;">
            Supervised model evaluation on the verified 20% held-out test split (1,407 test accounts).
        </p>
    </div>
    """, unsafe_allow_html=True)

    # Verification Note
    st.markdown("""
    <div style="background-color:#171B27; border-left:3px solid #8B7CFF; border-top:1px solid #292F40; border-right:1px solid #292F40; border-bottom:1px solid #292F40; border-radius:0 6px 6px 0; padding:10px 14px; margin-bottom:16px; font-size:0.78rem; color:#9299AD;">
        <span style="color:#F3F5FA; font-weight:600;">Methodological Note:</span>
        Held-out evaluation metrics below measure generalization on unseen records (20% test split, stratified). Individual customer probabilities in the Explorer are out-of-fold calibrated scores across the population.
    </div>
    """, unsafe_allow_html=True)

    perf_data = ml_service.get_model_metrics()

    mod_col1, mod_col2 = st.columns([1, 1])

    with mod_col1:
        st.markdown("""
        <div class="retainiq-card">
            <div style="font-size:0.95rem; font-weight:700; color:#F3F5FA; margin-bottom:2px;">
                Held-Out Benchmark Comparison (Test Split)
            </div>
            <div style="font-size:0.75rem; color:#9299AD; margin-bottom:12px;">
                Evaluating Logistic Regression vs. Random Forest Classifier
            </div>
        """, unsafe_allow_html=True)

        benchmark_table = [
            {
                "Model": m_name,
                "ROC-AUC": f"{m_info.roc_auc:.3f}",
                "Recall (Churn)": f"{m_info.recall * 100:.1f}%",
                "Precision": f"{m_info.precision * 100:.1f}%",
                "F1-Score": f"{m_info.f1_score:.3f}",
                "Accuracy": f"{m_info.accuracy * 100:.1f}%"
            }
            for m_name, m_info in perf_data.items()
        ]
        st.dataframe(pd.DataFrame(benchmark_table), use_container_width=True, hide_index=True)

        st.markdown("""
        <div style="font-size:0.74rem; color:#9299AD; margin-top:10px;">
            Both models attain <b>0.835 ROC-AUC</b>. Logistic Regression provides superior sensitivity (80.2% recall), capturing the vast majority of churning accounts for early intervention.
        </div>
        """, unsafe_allow_html=True)

        st.markdown("</div>", unsafe_allow_html=True)

    with mod_col2:
        st.markdown("""
        <div class="retainiq-card">
            <div style="font-size:0.95rem; font-weight:700; color:#F3F5FA; margin-bottom:2px;">
                Top Feature Importance Drivers (Random Forest)
            </div>
            <div style="font-size:0.75rem; color:#9299AD; margin-bottom:12px;">
                Normalized Gini importance ranking
            </div>
        """, unsafe_allow_html=True)

        rf_imp = ml_service.get_rf_feature_importance()[:8]
        if rf_imp:
            imp_df = pd.DataFrame([
                {"Feature": item.feature, "Importance": item.importance}
                for item in rf_imp
            ]).sort_values(by="Importance", ascending=True)

            fig_imp = px.bar(
                imp_df,
                x="Importance",
                y="Feature",
                orientation="h",
                color="Importance",
                color_continuous_scale=["#8B7CFF", "#55D9E8"]
            )
            fig_imp.update_layout(
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                coloraxis_showscale=False,
                margin=dict(t=10, b=10, l=10, r=10),
                height=220,
                xaxis=dict(showgrid=True, gridcolor="#292F40", title=""),
                yaxis=dict(title="")
            )
            st.plotly_chart(fig_imp, use_container_width=True)

        st.markdown("</div>", unsafe_allow_html=True)

# ---------------------------------------------------------------------------
# Footer
# ---------------------------------------------------------------------------
st.markdown("---")
st.markdown("""
<div style="display:flex; justify-content:space-between; align-items:center; font-size:0.72rem; color:#9299AD; padding:4px 0 16px 0;">
    <div><b>RETAINIQ</b> Churn Intelligence Command Center • Customer Churn Analysis and Prediction</div>
    <div>Strict Risk Boundaries: Low ≤ 0.40 • Medium 0.40–0.70 • High > 0.70</div>
</div>
""", unsafe_allow_html=True)
