import './App.css';
import { MenuItem,Select,FormControl,Card,CardContent} from '@material-ui/core';
import { useEffect, useState } from 'react';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import { prettyPrintStat, sortData  } from './util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";

function App() {

  const [countries,setCountries] = useState([]);
  const [country,setCountry] = useState('Worldwide');
  const [countryInfo,setCountryInfo] = useState({});
  const [tableData,setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom,setMapZoom] = useState(3);
  const [mapCountries,setMapCountries] = useState([]);
  const [casesType,setCasesType]= useState('cases');

  useEffect(()=>{
    fetch("https://disease.sh/v3/covid-19/all")
    .then(response=>response.json())
    .then(data=>{
      setCountryInfo(data);
    });
  },[]);

  useEffect(()=>{
    const getCountriesData = async()=>{
     await fetch('https://disease.sh/v3/covid-19/countries')
      .then(response=>response.json())
      .then(data=>{
        const countries = data.map(country=>({
          name : country.country,
          value:country.countryInfo.iso2,
        }))
        let sortedData = sortData(data);
        setTableData(sortedData);
        setCountries(countries);
        setMapCountries(data);
       console.log(data);
      })
    };
    getCountriesData();
  },[]);
  const onCountryChange =async (event)=>{
    const countryCode = event.target.value;
    //console.log(countryCode);
    const url =
      countryCode === "Worldwide" 
      ?  "https://disease.sh/v3/covid-19/all"
      : `https://disease.sh/v3/covid-19/countries/${countryCode}`

      await fetch(url)
      .then(response=>response.json())
      .then(data=>{
        setCountry(countryCode);
         console.log(data);
      setCountryInfo(data);
      countryCode === "Worldwide" 
      ?   setMapCenter([34.80746, -40.4796])
      :    setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
    
      setMapZoom(4);

      })

}
  
  return (
    <div className="app">     
     <div className="app__left">
     <div className="app__header">
        <h1>COVID-19 TRACKER</h1>

        <FormControl className="app__dropdown">
          <Select variant="outlined" onChange={onCountryChange} value={country}>
          <MenuItem value='Worldwide'>Worldwide</MenuItem>
            {countries.map(country=>(
              <MenuItem value={country.value}>{country.name}</MenuItem>
            
            ))}
            </Select>
        </FormControl>

      </div>
      
      <div className="app__stats">
              <InfoBox 
                onClick={e =>setCasesType("cases")} 
                isRed
                active ={casesType === "cases"}
                title="Coronavirus Cases"
                 cases={prettyPrintStat(countryInfo.todayCases)} 
                 total={prettyPrintStat(countryInfo.cases)}
                  />

              <InfoBox 
                onClick={e=>setCasesType("recovered")}
                active = {casesType === "recovered"}
              title="Recovered Cases"
               cases={prettyPrintStat(countryInfo.todayRecovered)} 
               total={prettyPrintStat(countryInfo.recovered)} 

               />

              <InfoBox 
              onClick={e => setCasesType("deaths")}
              isRed
              active ={casesType === "deaths"}
              title="Deaths" 
              cases={prettyPrintStat(countryInfo.todayDeaths)} 
              total={prettyPrintStat(countryInfo.deaths)} 

              />
      </div>

       <Map countries={mapCountries} casesType={casesType} center={mapCenter}  zoom={mapZoom}/>
     
     </div> 

     <div className="app__right">
     <Card>
       <CardContent >
            <div>
                 {/* Tables    */ }
            <h3>Live cases by country</h3> 
                  <Table countries={tableData} />
                {/* Graphs  */ }  
              <h3 className="app__graphTitle" >Worldwide new {casesType} </h3>
              <LineGraph className="app__graph" casesType={casesType} />
       
            </div>
         </CardContent>
      </Card>

     </div>       
    </div>
  );
}
export default App;