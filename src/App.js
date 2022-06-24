import './index.css'
import { useState, useEffect } from 'react'
import { Grid } from 'gridjs-react'
import "gridjs/dist/theme/mermaid.css";

function App() {

  const data = [
  ];

  return (
    <div style={{ padding: '50px 100px 100px 100px' }}>
      <p>Hello</p>
      <Grid
        data={[
          ['Hello', 'World'],
          ['Oi', 'You']
        ]}
        columns={['foo', 'bar']}
        search={true}
        pagination={{
          enabled: true,
          limit: 5,
        }}
      />
    </div>
  )

}

export default App;
