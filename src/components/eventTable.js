import { Link } from '@mui/material';

import { DataGridPro, GridColDef, GridFilterModel, GridToolbar } from '@mui/x-data-grid-pro';



export const initialFilterModel: GridFilterModel = {
  items: [
    { columnField: 'country', operatorValue: 'contains', value: 'USA' }
  ],
  debounceMs: 200
};

const country_list = [
  'USA', 'FRA', 'ESP'
];

const state_list = [
  'AL', 'AK', 'AS', 'AR',
  'CA', 'CO', 'CT',
  'DE', 'DC',
  'FL', 'FM',
  'GA', 'GU',
  'HI',
  'ID', 'IL', 'IN', 'IA',
  'KS', 'KY',
  'LA',
  'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT',
  'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
  'MP',
  'OH', 'OK', 'OR',
  'PW', 'PA', 'PR',
  'RI',
  'SC', 'SD',
  'TN', 'TX',
  'UT',
  'VT', 'VI', 'VA',
  'WA', 'WV', 'WI', 'WY'
];

export const month_list = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


const columns: GridColDef[] = [
  // { field: 'id', headerName: 'Id' , width: 80 },
  { field: 'name',
    headerName: 'Name',
    width: 400, 
    filterable: false,
    renderCell: (cellValues) => {
      return <Link href={`${cellValues.row.url}`}>{cellValues.row.name}</Link>;
    }
  },
  { field: 'url', headerName: 'url', filterable: false},
  { field: 'start_date', headerName: 'Date', type: 'date', valueGetter: ({ value }) => value && new Date(value), width: 200 },
  { field: 'month', headerName: 'Month', type: 'singleSelect', valueOptions: month_list},
  { field: 'city', headerName: 'City', width: 300, filterable: false },
  { field: 'state', headerName: 'State', width: 200, filterable: true, type: 'singleSelect', valueOptions: state_list },
  { field: 'country', headerName: 'Country', type: 'singleSelect', valueOptions: country_list, width: 150 },
  { field: 'render_event_distances', headerName: 'Distances', filterable: false, width: 400 }
];


export const EventTable = ({ current_events, page, pageSize, filterModel, setFilterModel, setPageSize, setPage }) => {
    console.log('In EventTable, events: ', current_events);
    return (
      <DataGridPro
      initialState={{
        columns: {
          columnVisibilityModel: {
            url: false,
            traderName: false,
          },
        },
      }}
      components={{ Toolbar: GridToolbar }}
      density="compact"
      pagination
      loading={current_events.loading}
      rowCount={current_events.totalRows}
      rowsPerPageOptions={current_events.rowsPerPageOptions}
      page={page}
      pageSize={pageSize}
      rows={current_events.rows}
      columns={columns}
      filterMode="server"
      filterModel={filterModel}
      onFilterModelChange={(newFilterModel) => setFilterModel(newFilterModel)}
      onPageSizeChange={(val) => {setPageSize(val)}}
      onPageChange={(val) => {setPage(val)}}
      />
    )
  };

export default EventTable;
