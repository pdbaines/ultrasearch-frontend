import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

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
          <Popup>
            <a href={event.url}>{event.name}</a>
            <br></br>
            {event.start_date}
            <br></br>
            {event.event_distances}
          </Popup>
        </Marker>
    ))
};

const EventMap = ({events}) => {
    return (
      <MapContainer
      style={{ height:"200px", marginTop:"10px", marginBottom:'10px' }}
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
    )
};

export default EventMap;