from bokeh.plotting import figure
from bokeh.layouts import widgetbox, row, column
from bokeh.models.widgets import Toggle
from bokeh.models import ColumnDataSource, FactorRange
from bokeh.transform import factor_cmap
from bokeh.palettes import Category20
from bokeh.models.callbacks import CustomJS
from bokeh.embed import components
JS_CODE = """
        var data = allsource.data;
        var data_ = source.data;
        scores = [];
        x = [];
        var lab = toggle.label.replace(' ','-');
        for (var i=0;i<data['scores'].length;i++){
            if (data['x'][i][0] == lab && toggle.active){
                scores.push(data['scores'][i])
                x.push(data['x'][i])
            }
        }
        for (var i=0;i<data_['scores'].length;i++){
            if (data_['x'][i][0] != lab){
                scores.push(data_['scores'][i])
                x.push(data_['x'][i])
            }
        }
        new_data = {'x':x,'scores':scores};
        source.data = new_data;
        if (x.length > 1){
            x_range.factors = x
            x_range.change.emit();
        }
        source.change.emit();
        """


def create_bokeh_plot(data):
    labels = [i.replace('-', ' ')
              for i in data[0]['score'].keys() if i != 'score']
    x = []
    scores = []
    rel_vars = [i for i in range(len(data))]
    for i in rel_vars:
        for k, v in data[i]['score'].items():
            if k != 'score':
                scores.append(v)
                x.append((k, str(i)))

    source = ColumnDataSource(data=dict(x=x, scores=scores))
    allsource = ColumnDataSource(data=dict(x=x, scores=scores))
    p = figure(x_range=FactorRange(*x))
    p.vbar(x='x', top='scores', source=source, width=0.9,
           fill_color=factor_cmap('x', palette=Category20[20],
                                  factors=[str(i) for i in rel_vars],
                                  start=1, end=2))

    p.y_range.start = 0
    p.x_range.range_padding = 0.01
    p.xaxis.major_label_orientation = 1
    p.xgrid.grid_line_color = None

    toggle_group = []
    for label in labels:
        toggle = Toggle(label=label, active=True)
        callback = CustomJS(args=dict(source=source,
                                      allsource=allsource,
                                      toggle=toggle,
                                      x_range=p.x_range), code=JS_CODE)
        toggle.js_on_click(callback)
        toggle_group.append(toggle)
    script, div = components(row(p, column(toggle_group)))
    id = div.split('=')[3].rstrip('"></div>\n</div>').strip('"')
    return script, id
