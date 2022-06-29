import './index.css'

import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Grid } from 'gridjs-react'
import { html } from 'gridjs'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import "gridjs/dist/theme/mermaid.css";

function App() {

  const [events, setEvents] = useState(null)

  const get_events = async (path) => {
    try {
      let { data, error, status } = await supabase
        .from('events')
        .select(`
          name,
          city,
          state,
          country,
          start_date,
          event_distances(
            distance,
            distance_units(
              unit_name
            )
          )
        `);
      console.log('data: ', data)
      console.log('status: ', status)
      if (data) {
        setEvents(data.name)
      }
    } catch (error) {
      console.log('Error retrieving data: ', error.message)
    }
  }

  // Regular object (✓):
  const events_json = [['foo'], ['bar']];

  // Regular function (✓):
  function events_func(){
    return [['fooey'], ['barry']]
  }

  // Via URL:

  // Via supbase client (✓):
  // Needs error handling, null result handling, 
  // performance improvements, security etc. but works
  const events_supabase_func = async() => {
    let {data, error, status } = await supabase.from('events').select(`
      name,
      url,
      city,
      state,
      country,
      start_date,
      event_distances(
        distance,
        distance_units(
          unit_name
        )
      )
    `);
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
    return data
  }


  // Return JSX
  return (
    <div style={{ padding: '50px 100px 100px 100px' }}>
      <p>Map</p>
      <MapContainer
          style={{ height:"400px", marginTop:"80px", marginBottom:'90px' }}
          center={[51.505, -0.09]}
          zoom={8}
          scrollWheelZoom={true}
          nowrap={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[51.505, -0.09]}>
          <Popup>
            A pretty CSS3 popup.
            <br />
            Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
       <p>Events</p>
      <Grid
        data={events_supabase_func}
        // Columns must match data names:
        columns={
          [
            {name: 'name', formatter: (_, row) => html(`<a href='${row.cells[1].data}'>${row.cells[0].data}</a>`)},
            {name: 'url', hidden: true},
            'city',
            'state',
            'country',
            'start_date',
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
