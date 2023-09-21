import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {theme} from './src/theme';
import {debounce} from 'lodash';

import {MagnifyingGlassIcon} from 'react-native-heroicons/outline';
import {MapPinIcon} from 'react-native-heroicons/solid';
import {CalendarDaysIcon} from 'react-native-heroicons/solid';
import {fetchLocations, fetchWeatherForecast} from './api/weather';
import * as Progress from 'react-native-progress';

import imageUpper from './src/assets/image/weather/sun.png';
import imageBottom from './src/assets/image/weather/sun-clouds-rain.png';
import sun from './src/assets/icon/sun-white.png';
import wind from './src/assets/icon/wind-white.png';
import hygrometer from './src/assets/icon/hygrometer-white.png';
import {getData, storeData} from './src/utils/asyncStorage';

export default function App() {
  //Main Logic
  const [isLastSearch, setisLastSearch] = useState(false);
  const [isSearchBarShow, setIsSearchBarShow] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  function handleLocation(location) {
    //console.log('Location: ', location.name);
    setLocations([]);
    setIsSearchBarShow(false);
    setLoading(true);
    fetchWeatherForecast({cityName: location.name, days: 7}).then(res => {
      //console.log('Get Forecast: ', res);
      setWeather(res);
      setLoading(false);
      storeData('city', location.name);
      //console.log(weather.name);
    });
  }

  function handleSearch(value) {
    //console.log('City Name: ', value);
    fetchLocations({cityName: value}).then(data => {
      //console.log('Data Post: ', data);
      setLocations(data);
    });
  }

  useEffect(() => {
    fetchLastWeatherData();
  }, []);

  const fetchLastWeatherData = async () => {
    let lastCity = await getData('city');
    let cityName = 'London';
    if (cityName) {
      cityName = lastCity;
    }
    fetchWeatherForecast({
      cityName,
      days: 7,
    }).then(res => {
      setWeather(res);
      setLoading(false);
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleTextDebounce = useCallback(debounce(handleSearch, 1000), []);
  const {current, location} = weather;

  return (
    <SafeAreaView style={styles.screenContainer}>
      <StatusBar backgroundColor="#1D1A31" />
      {loading ? (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}>
          <Progress.CircleSnail thickness={10} size={140} color="white" />
          <Text style={{color: 'white'}}>Loading...</Text>
        </View>
      ) : (
        <SafeAreaView style={styles.container}>
          <View>
            {/* SEARCH BAR */}
            <View style={stylesSerch.searchInputWrapper}>
              {isSearchBarShow ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  autoFocus={true}
                  placeholder="Search City"
                  placeholderTextColor={'lightgray'}
                  style={stylesSerch.searchInput}
                />
              ) : null}
              <TouchableOpacity
                style={stylesSerch.iconSearch}
                onPress={() => setIsSearchBarShow(!isSearchBarShow)}>
                <MagnifyingGlassIcon size={25} color="white" />
              </TouchableOpacity>
            </View>
            {/* SEARCH RESULT */}
            {locations?.length > 0 && isSearchBarShow ? (
              <View style={stylesSerch.searchResultItemContainer}>
                {locations.map((location, index) => {
                  return (
                    <TouchableOpacity
                      onPress={() => handleLocation(location)}
                      key={index}
                      style={stylesSerch.searchResultItem}>
                      <MapPinIcon size={25} color="gray" />
                      <Text style={{color: 'black'}}>
                        {location?.name}, {location?.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>
          <View style={stylesUpperInfo.container}>
            <Text style={stylesText.textDays}>
              {dayConverter(weather?.forecast?.forecastday[0])}
            </Text>
            <View style={stylesUpperInfo.line} />
            <Text style={stylesText.textLocation}>
              {location?.name}, {location?.country}
            </Text>
            <Image
              style={stylesUpperInfo.imageUpper}
              source={{uri: 'https:' + current?.condition?.icon}}
            />
            <Text style={stylesText.textTemperature}>{current?.temp_c}º</Text>
            <Text style={stylesText.textWeatherStatus}>
              {current?.condition.text}
            </Text>
            <View style={stylesUpperInfo.weatherStatusContainer}>
              <View style={stylesUpperInfo.weatherStatus}>
                <Image
                  source={wind}
                  style={stylesUpperInfo.weatherStatusImage}
                />
                <Text style={stylesText.textWeatherStatusNominal}>
                  {current?.wind_kph}km
                </Text>
              </View>
              <View style={stylesUpperInfo.weatherStatus}>
                <Image
                  source={hygrometer}
                  style={stylesUpperInfo.weatherStatusImage}
                />
                <Text style={stylesText.textWeatherStatusNominal}>
                  {current?.humidity}%
                </Text>
              </View>
              <View style={stylesUpperInfo.weatherStatus}>
                <Image
                  source={sun}
                  style={stylesUpperInfo.weatherStatusImage}
                />
                <Text style={stylesText.textWeatherStatusNominal}>
                  {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: 8,
            }}>
            <CalendarDaysIcon size={25} color="white" />
            <Text style={{color: 'white', fontSize: 13, marginHorizontal: 5}}>
              Daily Forecast
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{}}>
            {weather?.forecast?.forecastday?.map((item, index) => {
              let dayname = dayConverter(item);
              return (
                <View key={index} style={stylesDaily.container}>
                  <Image
                    style={stylesDaily.image}
                    source={{uri: 'https:' + item?.day?.condition?.icon}}
                  />
                  <Text style={stylesDaily.text}>{dayname}</Text>
                  <Text style={stylesDaily.textC}>{item?.day.avgtemp_c}º</Text>
                </View>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
}

function dayConverter(item) {
  let date = new Date(item.date);
  let options = {weekday: 'long'};
  let dayname = date.toLocaleDateString('en-US', options);
  return dayname.split(',')[0];
}

const stylesDaily = StyleSheet.create({
  container: {
    backgroundColor: theme.bgWhite(0.125),
    alignItems: 'center',
    borderRadius: 20,
    width: 85,
    marginVertical: 15,
    marginHorizontal: 10,
  },
  image: {
    width: 70,
    height: 70,
  },
  text: {
    color: 'white',
    fontSize: 12,
    marginTop: -5,
    marginBottom: 12,
  },
  textC: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: -10,
    marginBottom: 12,
  },
});

const stylesUpperInfo = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  line: {borderWidth: 1, borderColor: 'white', width: 200},
  imageUpper: {
    width: 250,
    height: 250,
  },
  weatherStatusContainer: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  weatherStatus: {
    flex: 1,
    flexDirection: 'row',
    height: 50,
    color: 'white',
    alignItems: 'center',
    marginVertical: 15,
  },
  weatherStatusImage: {
    width: 35,
    height: 35,
    marginHorizontal: 8,
  },
});

const stylesText = StyleSheet.create({
  textLocation: {
    color: 'white',
    fontSize: 20,
  },
  textDays: {
    color: 'white',
    fontSize: 50,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  textTemperature: {
    color: 'white',
    fontSize: 60,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  textWeatherStatus: {
    color: 'white',
    fontSize: 18,
  },
  textWeatherStatusNominal: {
    color: 'white',
    fontSize: 13,
  },
});

const stylesSerch = StyleSheet.create({
  searchInputWrapper: {
    flexDirection: 'row',
    marginVertical: 15,
  },
  searchInput: {
    paddingHorizontal: 15,
    color: 'white',
    backgroundColor: theme.bgWhite(0.3),
    borderWidth: 1,
    borderRadius: 25,
    width: '100%',
  },
  iconSearch: {
    backgroundColor: theme.bgWhite(0.4),
    margin: 2,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    padding: '3%',
  },
  magnifyIcon: {
    alignItems: 'center',
  },
  searchResultItemContainer: {
    backgroundColor: theme.bgWhite(0.99),
    color: 'white',
    borderRadius: 25,
    position: 'absolute',
    width: '100%',
    top: '90%',
    zIndex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    padding: 15,
  },
});

const styles = StyleSheet.create({
  screenContainer: {flex: 1, backgroundColor: '#1D1A31'},
  container: {marginHorizontal: 10, flexDirection: 'column'},
});
