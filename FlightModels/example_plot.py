from bokeh.plotting import figure
from bokeh.models import ColumnDataSource, FactorRange
from bokeh.transform import factor_cmap
from bokeh.palettes import Spectral5

from bokeh.embed import components
import os

data_path = os.path.join(os.path.dirname('.'), 'static/example.csv')


def zero(x):
    return x if x > 0 else 0


DAY_DICT = {'1': 'Mon', '2': 'Tues', '3': 'Wed',
            '4': 'Thurs', '5': 'Fri', '6': 'Sat', '7': 'Sun'}


def example_plot():
    """make a plot"""
    with open(data_path, 'r') as fp:
        data = fp.readlines()

    p = figure()
    x = []
    val = []
    for i in data[1:]:
        i = i.split(',')
        if i[0] != 'Virgin America':

            x.append((DAY_DICT[i[1]], i[0].split()[0]))
            val.append(zero(float(i[3]) + float(i[2])))
    # now reshape data into proper form
    names = sorted(list(set([i[1] for i in x])))
    source = ColumnDataSource(data=dict(x=x, val=val))

    p = figure(x_range=FactorRange(*x), title='JFK to SFO in Feb')
    p.vbar(x='x', top='val', source=source, width=0.9,
           fill_color=factor_cmap('x', palette=Spectral5,
                                  factors=names,
                                  start=1,
                                  end=2))
    p.xaxis.axis_label = 'Day of week'
    p.yaxis.axis_label = 'Worst case arrival (mean + std)'
    p.xaxis.major_label_orientation = 1.2
    return components(p)
