import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# Load your data
df = pd.read_csv('results.csv')

# Create figure with secondary y-axis
fig = make_subplots(
    rows=3, cols=1,
    shared_xaxes=True,
    vertical_spacing=0.05,
    subplot_titles=("Training & Validation Losses", "Precision/Recall/mAP Metrics", "Learning Rate Schedule"),
    specs=[[{"secondary_y": True}], [{"secondary_y": True}], [{}]]
)

# Add training loss traces
fig.add_trace(go.Scatter(
    x=df['epoch'], y=df['train/box_loss'],
    name='Train Box Loss', line=dict(color='#1f77b4'), 
    hovertemplate='Epoch: %{x}<br>Value: %{y:.3f}<extra></extra>'
), row=1, col=1)

fig.add_trace(go.Scatter(
    x=df['epoch'], y=df['train/cls_loss'],
    name='Train Class Loss', line=dict(color='#ff7f0e'),
    hovertemplate='Epoch: %{x}<br>Value: %{y:.3f}<extra></extra>'
), row=1, col=1)

fig.add_trace(go.Scatter(
    x=df['epoch'], y=df['train/dfl_loss'],
    name='Train DFL Loss', line=dict(color='#2ca02c'),
    hovertemplate='Epoch: %{x}<br>Value: %{y:.3f}<extra></extra>'
), row=1, col=1)

# Add validation loss traces (secondary y-axis)
fig.add_trace(go.Scatter(
    x=df['epoch'], y=df['val/box_loss'],
    name='Val Box Loss', line=dict(color='#1f77b4', dash='dot'),
    hovertemplate='Epoch: %{x}<br>Value: %{y:.3f}<extra></extra>'
), row=1, col=1, secondary_y=True)

fig.add_trace(go.Scatter(
    x=df['epoch'], y=df['val/cls_loss'],
    name='Val Class Loss', line=dict(color='#ff7f0e', dash='dot'),
    hovertemplate='Epoch: %{x}<br>Value: %{y:.3f}<extra></extra>'
), row=1, col=1, secondary_y=True)

fig.add_trace(go.Scatter(
    x=df['epoch'], y=df['val/dfl_loss'],
    name='Val DFL Loss', line=dict(color='#2ca02c', dash='dot'),
    hovertemplate='Epoch: %{x}<br>Value: %{y:.3f}<extra></extra>'
), row=1, col=1, secondary_y=True)

# Add metrics traces
metrics = ['metrics/precision(B)', 'metrics/recall(B)', 'metrics/mAP50(B)', 'metrics/mAP50-95(B)']
colors = ['#d62728', '#9467bd', '#8c564b', '#e377c2']

for metric, color in zip(metrics, colors):
    fig.add_trace(go.Scatter(
        x=df['epoch'], y=df[metric],
        name=metric.split('(')[0].split('/')[-1],
        line=dict(color=color),
        hovertemplate='Epoch: %{x}<br>Value: %{y:.3f}<extra></extra>'
    ), row=2, col=1)

# Add learning rate trace
fig.add_trace(go.Scatter(
    x=df['epoch'], y=df['lr/pg0'],
    name='Learning Rate', line=dict(color='#17becf'),
    hovertemplate='Epoch: %{x}<br>LR: %{y:.2e}<extra></extra>'
), row=3, col=1)

# Update layout
fig.update_layout(
    title='YOLOv8 Training Metrics Analysis',
    height=1000,
    hovermode='x unified',
    template='plotly_white',
    legend=dict(orientation='h', yanchor='bottom', y=1.02, xanchor='right', x=1),
    margin=dict(l=50, r=50, b=50, t=100, pad=4)
)

# Update y-axes titles
fig.update_yaxes(title_text="Loss Value", row=1, col=1)
fig.update_yaxes(title_text="Validation Loss Value", row=1, col=1, secondary_y=True)
fig.update_yaxes(title_text="Metric Value", row=2, col=1)
fig.update_yaxes(title_text="Learning Rate", type="log", row=3, col=1)

# Add annotations
fig.add_annotation(
    x=0.5, y=1.1,
    xref="paper", yref="paper",
    text="Training Progress Over 50 Epochs",
    showarrow=False,
    font=dict(size=16)
)

fig.show()