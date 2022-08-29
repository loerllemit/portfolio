import dash
from dash import dcc, html
from plotly.offline import plot
import plotly.graph_objs as go
from plotly.subplots import make_subplots
import numpy as np

from django_plotly_dash import DjangoDash


def plot_dpnl(modelname):
    data = list(modelname.objects.values())
    date = [i["date"] for i in data]
    pnl = [i["pnl"] for i in data]

    fig_dpnl = go.Figure(
        data=go.Bar(
            name="Plot1",
            x=date,
            y=pnl,
            text=pnl,
            marker_color=np.where(np.array(pnl) >= 0, "deepskyblue", "crimson"),
        )
    )
    fig_dpnl.update_layout(
        title_x=0.5,
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
        font_color="#7FDBFF",
        xaxis_title="Date",
        yaxis_title="Profit",
        title_text="Daily Realized PNL",
        template="simple_white",
        height=600,
    )  # xaxis_tickformat = '%m/%d/%y', xaxis_tickangle = -70

    fig_dpnl.update_traces(
        textposition="outside",
        showlegend=False,
        hovertemplate="date: %{x} <br>pnl: %{y}",
        cliponaxis=False,
    )

    fig_dpnl.update_xaxes(
        # rangeslider_visible=True,tickmode='linear', tick0 = x[0], dtick=86400000*4,
        rangeselector=dict(
            activecolor="rgb(47,79,79)",
            bgcolor="#708090",
            buttons=list(
                [
                    dict(count=1, label="MTD", step="month", stepmode="todate"),
                    dict(count=1, label="1m", step="month", stepmode="backward"),
                    dict(count=3, label="3m", step="month", stepmode="backward"),
                    dict(count=6, label="6m", step="month", stepmode="backward"),
                    dict(count=9, label="9m", step="month", stepmode="backward"),
                    dict(count=1, label="1y", step="year", stepmode="backward"),
                    dict(step="all"),
                ]
            ),
        )
    )
    # Turn graph object into local plotly graph
    plotly_plot_obj = plot({"data": fig_dpnl}, output_type="div")

    return plotly_plot_obj


def plot_tpnl(modelname):
    data = list(modelname.objects.values())
    date = [i["date"] for i in data]
    capital = [i["capital"] for i in data]
    pct_pnl = [i["pct_pnl"] for i in data]

    fig_tpnl = make_subplots(specs=[[{"secondary_y": True}]])

    fig_tpnl.add_trace(
        go.Scatter(x=date, y=capital),
        secondary_y=False,
    )
    fig_tpnl.add_trace(
        go.Scatter(x=date, y=pct_pnl, visible="legendonly"),
        secondary_y=True,
    )

    # fig_tpnl.add_hline(
    #     y=start_bal, line_width=2, line_dash="dash", line_color="#7FDBFF"
    # )

    fig_tpnl.update_layout(
        title_x=0.5,
        title_text="Total Realized Equity",
        xaxis_title="Date",
        template="simple_white",
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
        font_color="#7FDBFF",
        height=600,
    )

    fig_tpnl.update_yaxes(title_text="realized equity $", secondary_y=False)
    fig_tpnl.update_yaxes(title_text="% effective pnl", secondary_y=True)
    fig_tpnl.update_traces(hovertemplate="date: %{x} <br>equity: %{y}")
    fig_tpnl.update_xaxes(
        # rangeslider_visible=True,tickmode='linear', tick0 = x[0], dtick=86400000*4,
        rangeselector=dict(
            activecolor="rgb(47,79,79)",
            bgcolor="#708090",
            buttons=list(
                [
                    dict(count=1, label="MTD", step="month", stepmode="todate"),
                    dict(count=1, label="1m", step="month", stepmode="backward"),
                    dict(count=3, label="3m", step="month", stepmode="backward"),
                    dict(count=6, label="6m", step="month", stepmode="backward"),
                    dict(count=9, label="9m", step="month", stepmode="backward"),
                    dict(count=1, label="1y", step="year", stepmode="backward"),
                    dict(step="all"),
                ]
            ),
        )
    )

    # Turn graph object into local plotly graph
    plotly_plot_obj = plot({"data": fig_tpnl}, output_type="div")

    return plotly_plot_obj
