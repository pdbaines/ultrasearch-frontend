import './index.css'

import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { BrowserRouter } from "react-router-dom";

import EventMap from './components/eventMap'
// import EventTable from './components/eventTable'
import NavBar from './components/navBar'

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { GridFilterModel } from '@mui/x-data-grid';
import { GridToolbar } from '@mui/x-data-grid';


const maxRows = 250;

const eventObj1 = {
  loading: true,
  rows: [],
  totalRows: 0,
  rowsPerPageOptions: [20, 50, 100],
  pageSize: 50,
  page: 1
}

const eventObj2 = {
  loading: false,
  rows: [],
  totalRows: 10,
  rowsPerPageOptions: [2, 5, 10],
  pageSize: 5,
  page: 2
}

const initialFilterModel: GridFilterModel = {
  items: [
    { columnField: 'country', operatorValue: 'contains', value: 'USA' }
  ]
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

// const month_list = [{value: 1, label: 'Jan'}, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const month_list = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


const columns: GridColDef[] = [
  // { field: 'id', headerName: 'Id' , width: 80 },
  { field: 'name', headerName: 'Name', width: 400, filterable: false },
  { field: 'start_date', headerName: 'Date', type: 'date', valueGetter: ({ value }) => value && new Date(value), width: 200 },
  { field: 'month', headerName: 'Month', type: 'singleSelect', valueOptions: month_list},
  { field: 'city', headerName: 'City', width: 300, filterable: false },
  { field: 'state', headerName: 'State', width: 200, filterable: true, type: 'singleSelect', valueOptions: state_list },
  { field: 'country', headerName: 'Country', type: 'singleSelect', valueOptions: country_list, width: 150 },
  { field: 'render_event_distances', headerName: 'Distances', filterable: false, width: 400 }
];



function App() {


  // Need shared state for data for map and table,
  // so time to move away from function to storing data in state

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [events, setEvents] = useState(eventObj1);
  const [filterModel, setFilterModel] = useState(initialFilterModel);

  const updateEvents = (k, v) => setEvents((prev) => ({ ...prev, [k]: v}));

  const EventTable = ({ current_events }) => {
    console.log('In EventTable, events: ', current_events);
    return (
      <DataGrid
      // initialState={initialState}
      components={{ Toolbar: GridToolbar }}
      density="compact"
      pagination
      //paginationMode='server'
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
      // onPageSizeChange={(tmp_events) => {
      //   setEvents(
      //     prevEventState => ({
      //       ...prevEventState,
      //       page: 1,
      //       pageSize: current_events.pageSize + 1
      //     })
      //  )
          // updateEvents("page", 1);
          // updateEvents("pageSize", 20);
      //}}
      />
    )
  };

  // Regular object (✓):
  // const events_json = [['foo'], ['bar']];

  // Regular function (✓):
  // function events_func(){
  //   return [['fooey'], ['barry']]
  // };

  // Via supbase client (✓):
  // Needs error handling, null result handling, 
  // performance improvements, security etc. but works

  // To figure out:
  // this isn't being triggered on update of pageSize
  // the table is updating, the value is updating,
  // but the data is not.
  // So, if the initial fetch is 50 rows, and pageSize is 50,
  // and you update pageSize to 20, it will adjust. If 
  // you update pageSize to 100, it adjusts the table,
  // but the data only has 50 rows so it doesn't do anything.

  // page and page size shouldn't change the query
  // only want to re-query on filter change

  const events_supabase_func = async(filterModel) => {
    console.log('events inside supabase func: ', events);
    console.log('pageSize in supabase func: ', pageSize);
    console.log('filterModel in supabase func: ', filterModel);
    const fetch_field_string = `
    id,
    name,
    url,
    city,
    state,
    country,
    start_date,
    latitude,
    longitude,
    event_distances(
      distance
    )
    `

    // Needs to be conditional if there is a filter...
    const filter_field = filterModel.items[0].columnField
    const filter_value = filterModel.items[0].value

    let query = supabase.from('events')
      .select(fetch_field_string, {count: 'estimated'});

    // Conditional filtering:
    if (filter_field && filter_field != 'month') {
      query = query.eq(filter_field, filter_value);
    }

    // Always max:
    query = query.limit(maxRows);

    let {data, error, status, count } = await query;


    // TODO:
    // conditional - needs to work for no filter
    // filter on text is too slow
    // need to clearly distinguish what triggers db query
    // vs. client-side. Search client-side is fast.
    //
    // Server:
    //  -- country
    //  -- date (month only)
    //  -- distance
    //  -- all filters run on server, disable filtering on all other columns
    //
    // Client:
    //  -- everything else

    // Search:
    // -- server side search for name only
    //
    // Or:
    // -- cache_max
    // -- result_set
    // -- sort, search: no retrigger if result_set <= cache_max
    //      else if result_set > cache_max, server-side query
    // -- filter: always trigger

    // Pagination: .range(0, 9)
    // Example equality filter:
    // .eq('name', 'Habanero Hundred');
    console.log('status: ', status)
    console.log('error: ', error)
    console.log('query count: ', count)
    console.log('data (pre-map): ', data)

    data = data.map(function(e) { 
      e.render_event_distances = e.event_distances.flatMap(
        x => x.distance + ' ' + x.distance_units.unit_name).join(', ');
      e.month = month_list[new Date(e.start_date).getMonth()];
      return e;
    });

    // Need to do month filtering post-hoc:
    if (filter_field && filter_field == 'month') {
      data = data.filter(row => row.month == filter_value );
    }


    updateEvents("rows", data);
    updateEvents("totalRows", Math.min(count, maxRows));
    // Render the total results and ask to filter down to reduce...
    console.log('data (post-map): ', data);
    return data
  };

  // Only apply if events.page and events.pageSize have changed
  useEffect(() => {
    updateEvents("loading", true);
    events_supabase_func(filterModel);
    //updateEvents("rows", fresh_data);
    // Need to craft a query based on
    // filters, page etc. 
    updateEvents("loading", false);
  }, [pageSize, filterModel]);


  console.log('loose events: ', events);

  // Return JSX
  return (
    <div>
    <div>
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    </div>
    <div style={{ padding: '50px 100px 100px 100px' }}>
        <EventMap events={events.rows} />
        <div style={{ height: 800, width: '100%'}}>
        {/* Need <X /> signature instead of <X> </X> */}
        <EventTable
          current_events={events}
        />
        </div>
      <br></br>
    </div>
    <div>
    
    </div>
    </div>
  )

}

export default App;
