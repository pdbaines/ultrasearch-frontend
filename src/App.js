import './index.css'

import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { BrowserRouter } from "react-router-dom";

import EventMap from './components/eventMap'
import { EventTable, initialFilterModel, month_list } from './components/eventTable'
import NavBar from './components/navBar'

const eventObj1 = {
  loading: true,
  rows: [],
  totalRows: 0,
  rowsPerPageOptions: [20, 50, 100],
  pageSize: 50,
  page: 1
}

const maxRows = 2000;

function App() {


  // Need shared state for data for map and table,
  // so time to move away from function to storing data in state

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [events, setEvents] = useState(eventObj1);
  const [filterModel, setFilterModel] = useState(initialFilterModel);

  const updateEvents = (k, v) => setEvents((prev) => ({ ...prev, [k]: v}));

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
    const search_table = 'event_full';
    const fetch_field_string = `*`;
 
    let query = supabase.from(search_table)
      .select(fetch_field_string, {count: 'estimated'});

    // Add filters one-by-one:
    function query_appender(filter_item) {

      const filter_field = filter_item.columnField;
      const filter_value = filter_item.value;
      const filter_operator = filter_item.operatorValue;

      // Conditional filtering:
      if (filter_field && filter_field !== 'month') {
        switch (filter_operator) {
          case 'is': query = query.eq(filter_field, filter_value);
          break;
          case 'not': query = query.neq(filter_field, filter_value);
          break;
          case 'before': query = query.lt(filter_field, filter_value);
          break;
          case 'onOrBefore': query = query.lte(filter_field, filter_value);
          break;
          case 'after': query = query.gt(filter_field, filter_value);
          break;
          case 'onOrAfter': query = query.gte(filter_field, filter_value);
          break;
          case 'isAnyOf': query = query.in(filter_field, filter_value);
          break;
        }
      }
    }

    // Apply:
    filterModel.items.forEach(query_appender);

    // Always max:
    query = query.limit(maxRows);

    let {data, error, status, count } = await query;

    console.log('status: ', status)
    console.log('error: ', error)
    console.log('query count: ', count)
    console.log('data (pre-map): ', data)

    data = data.map(function(e) { 
      e.render_event_distances = e.event_distance_json.filter(
        x => !(x.distance == null)).flatMap(
          x => x.distance + ' ' + x.unit_name).join(', ');
      e.month = month_list[new Date(e.start_date).getMonth()];
      return e;
    });

    // Need to do month filtering post-hoc:
    //if (filter_field && filter_field === 'month') {
    //  data = data.filter(row => row.month === filter_value );
    //}


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
          page={page}
          pageSize={pageSize}
          filterModel={filterModel}
          setFilterModel={setFilterModel}
          setPageSize={setPageSize}
          setPage={setPage}
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
