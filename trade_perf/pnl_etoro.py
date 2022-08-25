# To add a new cell, type '# %%'
# To add a new markdown cell, type '# %% [markdown]'
# %%
import pandas as pd
import numpy as np
import json
from datetime import datetime

import plotly.graph_objects as go
import plotly.express as px
import plotly.io as pio
from plotly.subplots import make_subplots
from plotly_calplot import calplot

import dash
from dash import dcc
from dash import html
from dash.dash_table import DataTable, FormatTemplate
from dash.dash_table.Format import Format, Group, Scheme, Symbol
from dash.dependencies import Input, Output, State

pio.templates.default = "plotly_dark"

app = dash.Dash(__name__, external_stylesheets=['https://codepen.io/chriddyp/pen/bWLwgP.css'])
server = app.server

#%%
ios = "etoro-account-statement.xlsx"
df = pd.read_excel(ios,sheet_name='Account Activity', engine = 'openpyxl')

start_bal = df[df['Type']=='Deposit']['Realized Equity Change'].sum()  +  df[df['Type']=='Withdraw Request']['Realized Equity Change'].sum()

df = df[ (df['Type'] != 'Deposit') &  (df['Type'] != 'Withdraw Request') ]
df['Date'] = pd.to_datetime(df['Date'],format='%d/%m/%Y %H:%M:%S', utc=True).dt.tz_convert("Asia/Manila")
df['date'] = df['Date'].dt.date
df.sort_values(by=['date'],inplace=True,ignore_index=True)

daily_pnl = df.groupby(['date']).sum()
daily_pnl['tot_pnl'] = daily_pnl['Realized Equity Change'].cumsum()
daily_pnl['capital'] = start_bal + daily_pnl['tot_pnl']
daily_pnl['pct_pnl'] = (daily_pnl['capital']-start_bal)/start_bal * 100

pnl_df = df[df.Type == "Position closed" ]  # "Profit/Loss of Trade"
pnl_df.loc[:,'outcome'] = ['win' if x >= 0 else 'loss' for x in pnl_df['Realized Equity Change']]
pnl_df.loc[:,'streak']  = pnl_df['outcome'].groupby((pnl_df['outcome'] != pnl_df['outcome'].shift()).cumsum()).cumcount() + 1

win_streak   = pnl_df.groupby('outcome').max()['streak']['win']
loss_streak  = pnl_df.groupby('outcome').max()['streak']['loss']

win_trades   = len(pnl_df[pnl_df['outcome']=='win'])
loss_trades  = len(pnl_df[pnl_df['outcome']=='loss'])
tot_trades   = win_trades + loss_trades
win_rate     = win_trades/(tot_trades)*100 

total_fee    = df[df.Type != "Profit/Loss of Trade"]['Realized Equity Change'].sum()
total_gain   = pnl_df.groupby('outcome')['Realized Equity Change'].agg('sum')['win']
total_loss   = pnl_df.groupby('outcome')['Realized Equity Change'].agg('sum')['loss'] 

if total_fee >= 0:
    total_gain += total_fee
else:
    total_loss += total_fee

max_gain_trade = pnl_df['Realized Equity Change'].max()
max_loss_trade = pnl_df['Realized Equity Change'].min()
avg_gain     = total_gain/win_trades
avg_loss     = total_loss/loss_trades
profit_factor = abs(avg_gain/avg_loss)
expectancy_ratio = profit_factor * win_rate/100 - (100-win_rate)/100

# %%
## top losers and winners
top_df = pnl_df.groupby('Details').sum()
top_df = top_df.sort_values('Realized Equity Change').reset_index()
top_gain = top_df[top_df['Realized Equity Change'] >= 0].sort_values('Realized Equity Change', ascending=True).reset_index(drop=True)
top_loss = top_df[top_df['Realized Equity Change']  < 0].sort_values('Realized Equity Change', ascending=False).reset_index(drop=True)

# %%
## Most traded asset
most_traded = pnl_df.groupby('Details').size().reset_index(name='counts')
most_traded = most_traded.sort_values('counts',ascending=0,ignore_index=1)

# %%
## Daily pnl 
x = [ str(daily_pnl.index.tolist()[i]) for i in range(len(daily_pnl.index.tolist()))]
y = daily_pnl['Realized Equity Change'].round(decimals=2)

fig_dpnl = go.Figure(go.Bar(x=x, y=y, text=y, marker_color=np.where(y >= 0, 'deepskyblue', 'crimson')))
fig_dpnl.update_layout(title_x=0.5, plot_bgcolor =  "rgba(0,0,0,0)",paper_bgcolor =  "rgba(0,0,0,0)", font_color = '#7FDBFF',
                    xaxis_title = 'Date', yaxis_title = 'Profit', title_text='Daily Realized PNL',
                    template="simple_white",height=600) # xaxis_tickformat = '%m/%d/%y', xaxis_tickangle = -70
fig_dpnl.update_xaxes(
    # rangeslider_visible=True,tickmode='linear', tick0 = x[0], dtick=86400000*4,
    rangeselector=dict(activecolor="rgb(47,79,79)",bgcolor="#708090",
        buttons=list([
            dict(count=1, label="MTD", step="month", stepmode="todate"),
            dict(count=1, label="1m", step="month", stepmode="backward"),
            dict(count=3, label="3m", step="month", stepmode="backward"),
            dict(count=6, label="6m", step="month", stepmode="backward"),
            dict(count=1, label="1y", step="year", stepmode="backward"),
            dict(step="all")
        ])
    )
)
fig_dpnl.update_traces(textposition = 'outside',showlegend=False,
            hovertemplate = 'date: %{x} <br>pnl: %{y}',cliponaxis=False)
# fig_dpnl.show()


##############################################
# dummy_df = pd.DataFrame({"ds":pd.to_datetime(daily_pnl.index.values, format='%Y-%m-%d'), "value":y})
# fig_gg = calplot(dummy_df,x="ds", y='value',dark_theme=True,gap=0,years_title=True, colorscale="RdBu")
# fig_gg.update_layout(height=300, width=1400,plot_bgcolor = "rgba(0,0,0,0)",paper_bgcolor =  "rgba(0,0,0,0)")
# fig_gg.update_coloraxes(cmid=0,showscale=True)
##############################################
#%%
#total pnl
fig_tpnl = make_subplots(specs=[[{"secondary_y": True}]])
fig_tpnl.add_trace(go.Scatter(x=daily_pnl.index.tolist(),y=daily_pnl['capital']), secondary_y=False)
fig_tpnl.add_trace(go.Scatter(x=daily_pnl.index.tolist(),y=daily_pnl['pct_pnl'], visible='legendonly'), secondary_y=True)
fig_tpnl.add_hline(y=start_bal,line_width=2, line_dash="dash", line_color='#7FDBFF')

fig_tpnl.update_layout(title_x=0.5,title_text='Total Realized Equity',xaxis_title = 'Date',template="simple_white",plot_bgcolor = "rgba(0,0,0,0)", paper_bgcolor =  "rgba(0,0,0,0)", font_color = '#7FDBFF',
                        height=600)

fig_tpnl.update_yaxes(title_text="realized equity $", secondary_y=False)
fig_tpnl.update_yaxes(title_text="% effective pnl", secondary_y=True)
fig_tpnl.update_traces(hovertemplate = 'date: %{x} <br>equity: %{y}')
fig_tpnl.update_xaxes(
    # rangeslider_visible=True,tickmode='linear', tick0 = x[0], dtick=86400000*4,
    rangeselector=dict(activecolor="rgb(47,79,79)",bgcolor="#708090",
        buttons=list([
            dict(count=1, label="MTD", step="month", stepmode="todate"),
            dict(count=1, label="1m", step="month", stepmode="backward"),
            dict(count=3, label="3m", step="month", stepmode="backward"),
            dict(count=6, label="6m", step="month", stepmode="backward"),
            dict(count=1, label="1y", step="year", stepmode="backward"),
            dict(step="all")
        ]) 
    )
)


# %%
fig_gain = px.bar(top_gain['Details'],top_gain['Realized Equity Change'], text=top_gain['Details'], title='Top Gainers', 
          template="simple_white",color=top_gain['Realized Equity Change'],color_continuous_scale='Blues') 
fig_gain.update_layout(showlegend=False,title_x=0.5,plot_bgcolor =  "rgba(0,0,0,0)",paper_bgcolor =  "rgba(0,0,0,0)", font_color ='#7FDBFF',xaxis_title = 'total Profit', yaxis_visible = False,
                         coloraxis_showscale=False, autosize=True)
fig_gain.update_traces(marker_showscale=False,textposition = 'outside',hovertemplate = 'pnl: %{x} <br>symbol: %{text}',cliponaxis=False) 
fig_gain.update_xaxes(automargin=True)
# fig_gain.show()

# %%
fig_loss = px.bar(top_loss['Details'],top_loss['Realized Equity Change'], text=top_loss['Details'], title='Top Losers', 
          template="simple_white",color=top_loss['Realized Equity Change'],color_continuous_scale='Reds_r') 
fig_loss.update_layout(showlegend=False,title_x=0.5,plot_bgcolor =  "rgba(0,0,0,0)",paper_bgcolor =  "rgba(0,0,0,0)",                        font_color ='#7FDBFF',xaxis_title = 'total Loss', yaxis_title = ' ', yaxis_visible = False,  
                          coloraxis_showscale=False)
fig_loss.update_traces(showlegend=False,textposition = 'outside',hovertemplate = 'pnl: %{x} <br>symbol: %{text}',cliponaxis=False) 
# fig_loss.show()

# %%
fig_most_traded = px.pie(values=most_traded['counts'], names=most_traded['Details'],title="Most Traded Asset",hole=.3)
fig_most_traded.update_layout(showlegend=True,title_x=0.5,plot_bgcolor =  "rgba(0,0,0,0)",paper_bgcolor =  "rgba(0,0,0,0)",                        font_color ='#7FDBFF')
fig_most_traded.update_traces(scalegroup='one',textposition='inside')
# fig_most_traded.show()


# %%
## Statistics
name_list = ['win streak', 'loss streak', 'total trades','win trades', 'loss trades', '%win rate', 'total gain', 'total loss', 'avg. gain','avg. loss','max profit trade','max loss trade','profit factor','expectancy ratio']
val_list = [win_streak,loss_streak,tot_trades,win_trades,loss_trades, win_rate, total_gain, total_loss,avg_gain,avg_loss,max_gain_trade,max_loss_trade,profit_factor,expectancy_ratio]
# print(pd.DataFrame(val_list, index=name_list, columns=['']))  # [''] hides the column name (default: 0)

headerColor = 'grey'
rowEvenColor = 'lightgrey'
rowOddColor = 'white'

fig_stat = go.Figure(data=[go.Table(
  header=dict(
    values=['<b>Parameter</b>','<b>values</b>'],
    line_color='darkslategray',
    fill_color=headerColor,
    align=['right','left'],
    font=dict(color='white', size=12)
  ),
  cells=dict(
    values = [name_list,val_list],
    line_color='darkslategray',
    align = ['right', 'left'],
    fill_color = [[rowOddColor,rowEvenColor]*7],
    font = dict(color = 'darkslategray', size = 12)
    ))
])
fig_stat.update_layout(title_x=0.5,title_text='Statistics', plot_bgcolor =  "rgba(0,0,0,0)",paper_bgcolor =  "rgba(0,0,0,0)", font_color = '#7FDBFF')


# %%
app.layout = html.Div(children=[
    dcc.Graph(figure=fig_dpnl),
    # dcc.Graph(figure=fig_gg),
    dcc.Graph(figure=fig_tpnl),

    html.Div([
        html.Div([
            dcc.Graph(figure=fig_loss)
        ], className="six columns"),

        html.Div([
            dcc.Graph(figure=fig_gain)
        ], className="six columns"),
    ], className="row"),

    html.Div([
        html.Div([
            dcc.Graph(figure=fig_most_traded)
        ], className="six columns"),

        html.Div([
            dcc.Graph(figure=fig_stat)
        ], className="six columns"),
    ], className="row"),


    # html.Div([
        # dcc.Graph(figure=fig_stat, style={'width' :'40%', 'height' : '100%', 'display': 'inline-block'})],
        # style={'width' :'100%', 'height' : '100%','padding-left':'30%'})
])

# %%
if __name__ == '__main__':
    app.run_server(debug=False,host='0.0.0.0', port=8050)
# app.run_server(mode='external')
