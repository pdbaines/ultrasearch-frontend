import { Grid } from 'gridjs-react'
import { html } from 'gridjs'

import "gridjs/dist/theme/mermaid.css";

const EventTable = ({events}) => {
    return (
        <Grid
            data={events}
            // Columns must match data names:
            columns={
                [
                    { name: 'name', formatter: (_, row) => html(`<a href='${row.cells[1].data}'>${row.cells[0].data}</a>`) },
                    { name: 'url', hidden: true },
                    'city',
                    'state',
                    'country',
                    'start_date',
                    { name: 'latitude', hidden: true },
                    { name: 'longitude', hidden: true },
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
    )
};

export default EventTable;