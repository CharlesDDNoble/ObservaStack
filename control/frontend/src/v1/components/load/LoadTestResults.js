import React, { useMemo, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, TrendingUp, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';

const SortableHeader = ({ column, children }) => {
  const handleSort = useCallback(() => {
    column.toggleSorting(column.getIsSorted() === 'asc');
  }, [column]);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 text-xs hover:bg-input"
      onClick={handleSort}
    >
      {children}
      {column.getIsSorted() === 'asc' ? (
        <ArrowUp className="ml-1 h-3 w-3" />
      ) : column.getIsSorted() === 'desc' ? (
        <ArrowDown className="ml-1 h-3 w-3" />
      ) : (
        <ArrowUpDown className="ml-1 h-3 w-3" />
      )}
    </Button>
  );
};

const ProgressBar = ({ completed, total }) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  
  return (
    <div className="w-full bg-input rounded-full h-2 mb-2">
      <div 
        className="bg-info h-2 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

const StatCard = ({ icon, label, value, color = "text-foreground", highlight = false }) => (
  <div className={`bg-input border rounded-lg p-3 transition-all ${highlight ? 'border-border shadow-lg' : 'border-border'}`}>
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <div className={`text-lg font-semibold ${color}`}>
      {value}
    </div>
  </div>
);

const LoadTestResults = ({ results, isRunning, progress, summary }) => {
  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatNumber = (num) => {
    // For whole numbers, show no decimals
    if (Number.isInteger(num)) {
      return new Intl.NumberFormat().format(num);
    }
    // For decimals, show 2 decimal places
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  // Color code response times: green <100ms, yellow <500ms, red >500ms
  const getResponseTimeColor = (ms) => {
    if (ms < 100) return 'text-success';
    if (ms < 500) return 'text-warning';
    return 'text-destructive';
  };

  const getResponseTimeColorBg = (ms) => {
    if (ms < 100) return 'bg-success/10 border-success/30';
    if (ms < 500) return 'bg-warning/10 border-warning/30';
    return 'bg-destructive/10 border-destructive/30';
  };

  // Table columns definition
  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <SortableHeader column={column}>ID</SortableHeader>
        ),
        cell: ({ row }) => <span className="text-muted-foreground">#{row.getValue('id')}</span>,
      },
      {
        accessorKey: 'success',
        header: ({ column }) => (
          <SortableHeader column={column}>Status</SortableHeader>
        ),
        cell: ({ row }) => {
          const success = row.getValue('success');
          const status = row.original.status;
          return (
            <span className={success ? 'text-success' : 'text-destructive'}>
              {success ? status : 'Error'}
            </span>
          );
        },
      },
      {
        accessorKey: 'networkDuration',
        header: ({ column }) => (
          <SortableHeader column={column}>Network Time</SortableHeader>
        ),
        cell: ({ row }) => {
          const duration = row.getValue('networkDuration');
          return duration ? (
            <span className={getResponseTimeColor(duration)}>
              {formatDuration(duration)}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        accessorKey: 'queueTime',
        header: ({ column }) => (
          <SortableHeader column={column}>Queue Time</SortableHeader>
        ),
        cell: ({ row }) => {
          const queueTime = row.getValue('queueTime');
          const networkDuration = row.getValue('networkDuration');
          return queueTime > 0 ? (
            <span className={queueTime > networkDuration ? 'text-alert' : 'text-muted-foreground'}>
              {formatDuration(queueTime)}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        accessorKey: 'timestamp',
        header: ({ column }) => (
          <SortableHeader column={column}>Timestamp</SortableHeader>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {new Date(row.getValue('timestamp')).toLocaleTimeString()}
          </span>
        ),
      },
      {
        id: 'result',
        header: 'Result',
        cell: ({ row }) => {
          const success = row.original.success;
          const errorType = row.original.errorType;
          const error = row.original.error;
          return (
            <span 
              className={success ? 'text-success' : 'text-destructive'}
              title={error || ''}
            >
              {success ? '✓' : `✗ ${errorType || 'Error'}`}
            </span>
          );
        },
      },
    ],
    []
  );

  // Get last 50 results for table
  const tableData = useMemo(() => results.slice(-50).reverse(), [results]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {isRunning && (
        <div className="mb-4 flex-shrink-0">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{progress.completed} / {progress.total}</span>
          </div>
          <ProgressBar completed={progress.completed} total={progress.total} />
        </div>
      )}

      {summary && (
        <div className="space-y-4 mb-4 flex-shrink-0 max-h-[60%] overflow-y-auto panel-scroll">
          {/* Performance Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getResponseTimeColorBg(summary.averageResponseTime)}`}>
            <div className={`w-2 h-2 rounded-full ${summary.averageResponseTime < 100 ? 'bg-success' : summary.averageResponseTime < 500 ? 'bg-warning' : 'bg-destructive'} status-pulse`} />
            <span className={`text-sm font-semibold ${getResponseTimeColor(summary.averageResponseTime)}`}>
              {summary.averageResponseTime < 100 ? 'Excellent Performance' : summary.averageResponseTime < 500 ? 'Good Performance' : 'Needs Optimization'}
            </span>
          </div>

          {/* Primary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard
              icon={<TrendingUp size={16} className="text-info" />}
              label="Total Requests"
              value={formatNumber(summary.total)}
            />
            <StatCard
              icon={<CheckCircle size={16} className="text-success" />}
              label="Successful"
              value={formatNumber(summary.successful)}
              color="text-success"
            />
            <StatCard
              icon={<XCircle size={16} className="text-destructive" />}
              label="Failed"
              value={formatNumber(summary.failed)}
              color={summary.failed > 0 ? "text-destructive" : "text-foreground"}
            />
            <StatCard
              icon={<TrendingUp size={16} className="text-chart-purple" />}
              label="Requests/sec"
              value={formatNumber(summary.requestsPerSecond || 0)}
              color="text-chart-purple"
            />
            <StatCard
              icon={<Clock size={16} className="text-warning" />}
              label="Avg Network Time"
              value={formatDuration(summary.averageResponseTime)}
              color={getResponseTimeColor(summary.averageResponseTime)}
              highlight={true}
            />
            <StatCard
              icon={<Clock size={16} className="text-alert" />}
              label="Max Network Time"
              value={formatDuration(summary.maxResponseTime)}
              color={getResponseTimeColor(summary.maxResponseTime)}
              highlight={true}
            />
          </div>
          
          {/* Queue Performance Metrics */}
          {(summary.averageQueueTime > 0 || summary.maxQueueTime > 0) && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Queue Performance</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard
                  icon={<Clock size={16} className="text-chart-cyan" />}
                  label="Avg Queue Time"
                  value={formatDuration(summary.averageQueueTime)}
                  color="text-chart-cyan"
                />
                <StatCard
                  icon={<Clock size={16} className="text-destructive" />}
                  label="Max Queue Time"
                  value={formatDuration(summary.maxQueueTime)}
                  color="text-destructive"
                />
                <StatCard
                  icon={<TrendingUp size={16} className="text-muted-foreground" />}
                  label="Queue Efficiency"
                  value={`${Math.round((1 - (summary.averageQueueTime / (summary.averageResponseTime + summary.averageQueueTime))) * 100)}%`}
                  color={summary.averageQueueTime > summary.averageResponseTime ? "text-destructive" : "text-success"}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
                <p>• Network Time: Actual API response time (most accurate metric)</p>
                <p>• Queue Time: Time spent waiting due to browser concurrency limits</p>
                <p>• Queue Efficiency: Lower queue time = better browser resource utilization</p>
              </div>
            </div>
          )}
        </div>
      )}

      {results.length > 0 && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-2 flex-shrink-0">
            <h4 className="text-sm font-medium text-foreground">Request Details</h4>
            <span className="text-xs text-muted-foreground">Showing last 50 requests (click headers to sort)</span>
          </div>
          
          <div className="border border-border rounded-md flex-1 overflow-auto panel-scroll">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className="hover:bg-input/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-2">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {results.length === 0 && !isRunning && (
        <div className="text-center text-muted-foreground py-8">
          No load test results yet. Configure and run a test above.
        </div>
      )}
    </div>
  );
};

export default LoadTestResults;
