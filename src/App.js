import './index.css'

import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Grid } from 'gridjs-react'
import { html } from 'gridjs'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import "gridjs/dist/theme/mermaid.css";

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

  function remove_nulls(item) {
    // console.log(item.latitude)
    if (item.latitude == null || item.longitude == null) {
      return false
    } else {
      return true
    }
  };

  const EventMarkers = ({ data }) => {
    // lat/lon can be null
    console.log('EventMarkers data: ', data)
    data = data.filter(remove_nulls)
    console.log('Filtered EventMarkers data: ', data)
    return data.map(event => (
        <Marker
          key={event.id}
          position={[ event.latitude , event.longitude ]}
        >
          <Popup>{event.name}</Popup>
        </Marker>
    ))
  };

  // Return JSX
  return (
    <div style={{ padding: '50px 100px 100px 100px' }}>
      <p>Map</p>
      <MapContainer
          style={{ height:"600px", marginTop:"80px", marginBottom:'90px' }}
          center={[42, -110]}
          zoom={4}
          scrollWheelZoom={true}
          nowrap={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <EventMarkers data={events} />
      </MapContainer>
       <p>Events</p>
      <Grid
        data={events}
        // Columns must match data names:
        columns={
          [
            {name: 'name', formatter: (_, row) => html(`<a href='${row.cells[1].data}'>${row.cells[0].data}</a>`)},
            {name: 'url', hidden: true},
            'city',
            'state',
            'country',
            'start_date',
            {name: 'latitude', hidden: false},
            {name: 'longitude', hidden: false},
            'event_distances'
          ]
        }
        search={true}
        sort={true}
        pagination={{
          enabled: true,
          limit: 20,
        }}
      />
      <br></br>

    </div>
  )

}

export default App;
