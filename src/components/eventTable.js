import { DataGrid, GridColDef } from '@mui/x-data-grid';


const columns: GridColDef[] = [
    { field: 'id', headerName: 'Id' , width: 80 },
    { field: 'name', headerName: 'Name', width: 200 }
]

const EventTable = ({events}) => {
    return (
        <DataGrid
            rows={events}
            columns={columns}
        />
    )
};
// formatter: (_, row) => html(`<a href='${row.cells[1].data}'>${row.cells[0].data}</a>`)
export default EventTable;