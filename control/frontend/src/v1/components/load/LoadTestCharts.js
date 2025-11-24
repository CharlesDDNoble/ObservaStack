import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

const LoadTestCharts = ({ chartData = [], isRunning }) => {
  // Downsample data when there are too many points to keep charts clean
  const downsampledData = useMemo(() => {
    if (chartData.length <= 50) {
      return chartData; // No downsampling needed for small datasets
    }
    
    // Use max-min decimation - keeps peaks and troughs visible
    const targetPoints = 50;
    const step = Math.ceil(chartData.length / targetPoints);
    const downsampled = [];
    
    for (let i = 0; i < chartData.length; i += step) {
      const chunk = chartData.slice(i, Math.min(i + step, chartData.length));
      
      // Keep the point with max value in this chunk (for visibility)
      const maxPoint = chunk.reduce((max, point) => 
        point.rps > max.rps ? point : max
      , chunk[0]);
      
      downsampled.push(maxPoint);
    }
    
    // Always include the last point for accuracy
    if (downsampled[downsampled.length - 1] !== chartData[chartData.length - 1]) {
      downsampled.push(chartData[chartData.length - 1]);
    }
    
    return downsampled;
  }, [chartData]);

  // Chart options for RPS and Error Rate
  const throughputChartOptions = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      borderColor: '#374151',
      textStyle: {
        color: '#D4D4D8'
      }
    },
    legend: {
      data: ['RPS', 'Error Rate'],
      textStyle: {
        color: '#9CA3AF'
      },
      top: 0
    },
    grid: {
      left: '60px',
      right: '4%',
      bottom: '50px',
      top: '15%',
      containLabel: false
    },
    xAxis: {
      type: 'value',
      name: 'Time (ms)',
      nameLocation: 'center',
      nameGap: 35,
      nameTextStyle: {
        color: '#9CA3AF',
        fontSize: 12
      },
      axisLabel: {
        color: '#6B7280',
        formatter: (value) => `${(value / 1000).toFixed(1)}s`
      },
      splitLine: {
        lineStyle: {
          color: '#374151'
        }
      }
    },
    yAxis: [
      {
        type: 'value',
        name: 'RPS',
        nameLocation: 'middle',
        nameGap: 45,
        nameRotate: 90,
        nameTextStyle: {
          color: '#9CA3AF',
          fontSize: 12
        },
        axisLabel: {
          color: '#6B7280'
        },
        splitLine: {
          lineStyle: {
            color: '#374151'
          }
        }
      },
      {
        type: 'value',
        name: 'Error Rate (%)',
        nameLocation: 'middle',
        nameGap: 45,
        nameRotate: 90,
        nameTextStyle: {
          color: '#9CA3AF',
          fontSize: 12
        },
        axisLabel: {
          color: '#6B7280',
          formatter: '{value}%'
        },
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: 'RPS',
        type: 'line',
        smooth: true,
        showSymbol: false, // Hide points for cleaner look
        data: downsampledData.map(d => [d.time, d.rps.toFixed(2)]),
        itemStyle: {
          color: '#5B8FC4'
        },
        lineStyle: {
          width: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(91, 143, 196, 0.3)' },
              { offset: 1, color: 'rgba(91, 143, 196, 0.05)' }
            ]
          }
        }
      },
      {
        name: 'Error Rate',
        type: 'line',
        smooth: true,
        showSymbol: false, // Hide points for cleaner look
        yAxisIndex: 1,
        data: downsampledData.map(d => [d.time, d.errorRate.toFixed(2)]),
        itemStyle: {
          color: '#B87278'
        },
        lineStyle: {
          width: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(184, 114, 120, 0.3)' },
              { offset: 1, color: 'rgba(184, 114, 120, 0.05)' }
            ]
          }
        }
      }
    ]
  }), [downsampledData]);

  // Chart options for Latency Percentiles
  const latencyChartOptions = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      borderColor: '#374151',
      textStyle: {
        color: '#D4D4D8'
      },
      formatter: (params) => {
        let result = `<div style="font-weight: bold;">${(params[0].value[0] / 1000).toFixed(1)}s</div>`;
        params.forEach(param => {
          result += `<div style="margin-top: 4px;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${param.color};margin-right:5px;"></span>
            ${param.seriesName}: <strong>${param.value[1]}ms</strong>
          </div>`;
        });
        return result;
      }
    },
    legend: {
      data: ['P50', 'P90', 'P99', 'Max'],
      textStyle: {
        color: '#9CA3AF'
      },
      top: 0
    },
    grid: {
      left: '60px',
      right: '4%',
      bottom: '50px',
      top: '15%',
      containLabel: false
    },
    xAxis: {
      type: 'value',
      name: 'Time (ms)',
      nameLocation: 'center',
      nameGap: 35,
      nameTextStyle: {
        color: '#9CA3AF',
        fontSize: 12
      },
      axisLabel: {
        color: '#6B7280',
        formatter: (value) => `${(value / 1000).toFixed(1)}s`
      },
      splitLine: {
        lineStyle: {
          color: '#374151'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: 'Latency (ms)',
      nameLocation: 'middle',
      nameGap: 45,
      nameRotate: 90,
      nameTextStyle: {
        color: '#9CA3AF',
        fontSize: 12
      },
      axisLabel: {
        color: '#6B7280'
      },
      splitLine: {
        lineStyle: {
          color: '#374151'
        }
      }
    },
    series: [
      {
        name: 'P50',
        type: 'line',
        smooth: true,
        showSymbol: false, // Hide points for cleaner look
        data: downsampledData.map(d => [d.time, d.p50]),
        itemStyle: {
          color: '#87A87E'
        },
        lineStyle: {
          width: 2
        }
      },
      {
        name: 'P90',
        type: 'line',
        smooth: true,
        showSymbol: false, // Hide points for cleaner look
        data: downsampledData.map(d => [d.time, d.p90]),
        itemStyle: {
          color: '#C4976B'
        },
        lineStyle: {
          width: 2
        }
      },
      {
        name: 'P99',
        type: 'line',
        smooth: true,
        showSymbol: false, // Hide points for cleaner look
        data: downsampledData.map(d => [d.time, d.p99]),
        itemStyle: {
          color: '#C4B86B'
        },
        lineStyle: {
          width: 2
        }
      },
      {
        name: 'Max',
        type: 'line',
        smooth: true,
        showSymbol: false, // Hide points for cleaner look
        data: downsampledData.map(d => [d.time, d.maxLatency]),
        itemStyle: {
          color: '#B87278'
        },
        lineStyle: {
          width: 1,
          type: 'dashed'
        }
      }
    ]
  }), [downsampledData]);

  if (!isRunning && chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        No chart data yet. Run a load test to see live metrics.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="bg-input border border-border rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <h5 className="text-xs font-medium text-muted-foreground">Throughput & Error Rate</h5>
            {chartData.length > 50 && (
              <span className="text-[10px] text-muted-foreground opacity-60">
                ~{downsampledData.length} of {chartData.length} points
              </span>
            )}
          </div>
          <div className="flex-1 min-h-0">
            <ReactECharts 
              option={throughputChartOptions} 
              style={{ height: '100%', minHeight: '200px' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        </div>
        <div className="bg-input border border-border rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <h5 className="text-xs font-medium text-muted-foreground">Latency Percentiles</h5>
            {chartData.length > 50 && (
              <span className="text-[10px] text-muted-foreground opacity-60">
                ~{downsampledData.length} of {chartData.length} points
              </span>
            )}
          </div>
          <div className="flex-1 min-h-0">
            <ReactECharts 
              option={latencyChartOptions} 
              style={{ height: '100%', minHeight: '200px' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadTestCharts;
