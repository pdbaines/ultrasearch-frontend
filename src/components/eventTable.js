import * as React from 'react';

import Box from '@mui/material/Box';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { Link } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import {
  DataGridPro,
  GridColDef,
  GridFilterModel,
  GridToolbar,
  GridFilterInputValueProps,
  getGridDateOperators
} from '@mui/x-data-grid-pro';


export const initialFilterModel: GridFilterModel = {
  items: [
    { columnField: 'country', operatorValue: 'contains', value: 'USA' }
  ],
  debounceMs: 200
};

const country_list = [
  'ARG', 'AUS', 'AUT',
  'BEL', 'BGR', 'BIH', 'BMU', 'BRE',
  'CAN', 'CHE', 'CHN', 'COL',
  'DEU',
  'ESP',
  'FIN', 'FRA',
  'GBR', 'GRC', 'HRV',
  'IRL', 'ISL', 'ITA',
  'JPN',
  'LIE',
  'MDG', 'MDV', 'MEX', 'MTQ', 'MUS', 'MYS',
  'NLD', 'NOR', 'NZL',
  'PER', 'POL', 'PRT',
  'REU', 'RUS',
  'SVK', 'SWE', 'THA', 'TUR', 'TZA',
  'UKR', 'USA',
  'VNM',
  'ZAF', 'ZWE'
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

export const month_list = [
  { value: 1, label: 'Jan'},
  { value: 2, label: 'Feb'},
  { value: 3, label: 'Mar'},
  { value: 4, label: 'Apr'},
  { value: 5, label: 'May'},
  { value: 6, label: 'Jun'},
  { value: 7, label: 'Jul'},
  { value: 8, label: 'Aug'},
  { value: 9, label: 'Sep'},
  { value: 10, label: 'Oct'},
  { value: 11, label: 'Nov'},
  { value: 12, label: 'Dec'}
];

const SUBMIT_FILTER_STROKE_TIME = 1000;

function DistanceInputInterval(props: GridFilterInputValueProps) {

  // applyValue operates on GridFilterItem
  const { item, applyValue, focusElementRef = null } = props;
  const filterTimeout = React.useRef();
  const [filterValueState, setFilterValueState] = React.useState(
    item.value ?? '',
  );
  const [applying, setIsApplying] = React.useState(false);

  React.useEffect(() => {
    return () => {
      clearTimeout(filterTimeout.current);
    };
  }, []);

  React.useEffect(() => {
    const itemValue = item.value ?? [undefined, undefined];
    setFilterValueState(itemValue);
  }, [item.value]);

  const updateFilterValue = (lowerBound: string, upperBound: string) => {
    clearTimeout(filterTimeout.current);
    setFilterValueState([lowerBound, upperBound]);

    setIsApplying(true);
    filterTimeout.current = setTimeout(() => {
      setIsApplying(false);
      applyValue({ ...item, value: [lowerBound, upperBound] });
    }, SUBMIT_FILTER_STROKE_TIME);
  };

  const handleUpperFilterChange: TextFieldProps['onChange'] = (event) => {
    const newUpperBound = event.target.value;
    updateFilterValue(filterValueState[0], newUpperBound);
  };
  const handleLowerFilterChange: TextFieldProps['onChange'] = (event) => {
    const newLowerBound = event.target.value;
    updateFilterValue(newLowerBound, filterValueState[1]);
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'end',
        height: 48,
        pl: '20px',
      }}
    >
      <TextField
        name="lower-bound-input"
        placeholder=""
        label="From (km)"
        variant="standard"
        value={Number(filterValueState[0])}
        onChange={handleLowerFilterChange}
        type="number"
        inputRef={focusElementRef}
        sx={{ mr: 2 }}
      />
      <TextField
        name="upper-bound-input"
        placeholder=""
        label="To (km)"
        variant="standard"
        value={Number(filterValueState[1])}
        onChange={handleUpperFilterChange}
        type="number"
        InputProps={applying ? { endAdornment: <SyncIcon /> } : {}}
      />
    </Box>
  );
}

const distanceOperators: GridFilterOperator[] = [
  {
    label: 'Between',
    value: 'distanceBetween',
    getApplyFilterFn: (filterItem: GridFilterItem) => {
      // Filtering is done server side, we just update the filter values
      return ({params}): boolean => {return true};
    },
    InputComponent: DistanceInputInterval,
  },
];


const columns: GridColDef[] = [
  { field: 'name',
    headerName: 'Name',
    width: 400, 
    filterable: false,
    renderCell: (cellValues) => {
      return <Link href={`${cellValues.row.url}`}>{cellValues.row.name}</Link>;
    }
  },
  { field: 'url', headerName: 'url', filterable: false},
  {
    field: 'start_date',
    headerName: 'Date',
    type: 'date',
    valueGetter: ({ value }) => value && new Date(value),
    width: 200,
    filterOperators: getGridDateOperators().filter(
      (operator) =>
        operator.value === 'is' ||
        operator.value === 'onOrBefore' ||
        operator.value === 'onOrAfter'
    )
  },
  {
    field: 'month',
    headerName: 'Month',
    type: 'singleSelect',
    valueOptions: month_list,
    valueGetter: ({ value }) => value.label
  },
  { field: 'city', headerName: 'City', width: 300, filterable: false },
  { field: 'state', headerName: 'State', width: 200, filterable: true, type: 'singleSelect', valueOptions: state_list },
  { field: 'country', headerName: 'Country', type: 'singleSelect', valueOptions: country_list, width: 150 },
  {
    field: 'render_event_distances',
    headerName: 'Distances',
    filterable: true,
    filterOperators: distanceOperators,
    width: 400
  }
];


export const EventTable = ({ current_events, page, pageSize, filterModel, setFilterModel, setPageSize, setPage }) => {
    console.log('In EventTable, events: ', current_events);
    console.log('In EventTable, filterModel: ', filterModel);
    return (
      <DataGridPro
      initialState={{
        columns: {
          columnVisibilityModel: {
            url: false
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
