import dash
from dash import dcc, html
from plotly.offline import plot
import plotly.graph_objs as go
import plotly.express as px
from plotly.subplots import make_subplots
import numpy as np

from django_plotly_dash import DjangoDash


def plot_dpnl(dataname):  # ==> daily pnl
    # data = list(modelname.objects.values())
    # date = [i["date"] for i in data]
    date = dataname.date
    pnl = dataname.rec

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
        showlegend=False,
        # margin=dict(l=0, r=0, t=0, b=0),
    )  # xaxis_tickformat = '%m/%d/%y', xaxis_tickangle = -70

    fig_dpnl.update_traces(
        textposition="outside",
        showlegend=False,
        hovertemplate="date: %{x} <br>pnl: %{y:$.2f} <extra></extra>",
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


def plot_tpnl(start_bal, dataname):  # ==> total pnl
    # data = list(modelname.objects.values())
    # date = [i["date"] for i in data]
    date = dataname.date
    capital = dataname.capital
    pct_pnl = dataname.pct_pnl

    fig_tpnl = make_subplots(specs=[[{"secondary_y": True}]])

    fig_tpnl.add_trace(
        go.Scatter(x=date, y=capital),
        secondary_y=False,
    )
    fig_tpnl.add_trace(
        go.Scatter(x=date, y=pct_pnl, visible="legendonly"),
        secondary_y=True,
    )

    fig_tpnl.add_hline(
        y=start_bal, line_width=2, line_dash="dash", line_color="#7FDBFF"
    )

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
    fig_tpnl.update_traces(hovertemplate="date: %{x} <br>equity: %{y} <extra></extra>")
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


def plot_gain(top_gain):  # ==>  assets with profit
    fig_gain = go.Figure(
        data=go.Bar(
            x=top_gain["details"],
            y=top_gain["realized_equity_change"],
            text=top_gain["details"],
            textposition="outside",
            marker=dict(color=top_gain["realized_equity_change"], colorscale="Blues"),
        )
    )
    fig_gain.update_layout(
        title="Top Gainers",
        template="simple_white",
        showlegend=False,
        title_x=0.5,
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
        font_color="#7FDBFF",
        yaxis_title="total Profit",
        xaxis_visible=True,
        coloraxis_showscale=True,
        autosize=True,
    )
    fig_gain.update_traces(
        marker_showscale=False,
        hovertemplate="pnl: %{y:$.2f} <br>symbol: %{text} <extra></extra>",
        cliponaxis=False,
    )
    fig_gain.update_yaxes(automargin=True)

    plotly_plot_obj = plot({"data": fig_gain}, output_type="div")

    return plotly_plot_obj


def plot_loss(top_loss):  # ==>  assets with losses
    fig_loss = go.Figure(
        data=go.Bar(
            x=top_loss["details"],
            y=top_loss["realized_equity_change"],
            text=top_loss["details"],
            textposition="outside",
            marker=dict(color=top_loss["realized_equity_change"], colorscale="Reds_r"),
        )
    )
    fig_loss.update_layout(
        title="Top Losers",
        template="simple_white",
        showlegend=False,
        title_x=0.5,
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
        font_color="#7FDBFF",
        yaxis_title="total Profit",
        xaxis_visible=True,
        coloraxis_showscale=True,
        autosize=True,
    )
    fig_loss.update_traces(
        marker_showscale=False,
        hovertemplate="pnl: %{y:$.2f} <br>symbol: %{text} <extra></extra>",
        cliponaxis=False,
    )
    fig_loss.update_yaxes(automargin=True)

    plotly_plot_obj = plot({"data": fig_loss}, output_type="div")

    return plotly_plot_obj
