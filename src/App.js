import './index.css'

import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

import EventMap from './components/eventMap'
import EventTable from './components/eventTable'


function App() {


  // Need shared state for data for map and table,
  // so time to move away from function to storing data in state

  const [events, setEvents] = useState([]);

  // Regular object (✓):
  // const events_json = [['foo'], ['bar']];

  // Regular function (✓):
  // function events_func(){
  //   return [['fooey'], ['barry']]
  // };

  // Via supbase client (✓):
  // Needs error handling, null result handling, 
  // performance improvements, security etc. but works
  const events_supabase_func = async() => {
    let {data, error, status } = await supabase.from('events').select(`
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
        distance,
        distance_units(
          unit_name
        )
      )
    `)
    // Example equality filter:
    // .eq('name', 'Habanero Hundred');
    console.log('status: ', status)
    console.log('error: ', error)
    console.log('data: ', data)

    data = data.map(function(e) { 
      e.event_distances = e.event_distances.flatMap(x => x.distance + ' ' + x.distance_units.unit_name).join(', '); 
      return e;
    });
    console.log('data: ', data)
    setEvents(data)
  };

  useEffect(() => {
    events_supabase_func()
  }, []);

  // Return JSX
  return (
    <div style={{ padding: '50px 100px 100px 100px' }}>
      <p>Map</p>
      <EventMap events={events} />
       <p>Events</p>
      <EventTable events={events} />
      <br></br>

    </div>
  )

}

export default App;
