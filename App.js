import {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  Image,
  StatusBar
} from 'react-native';
import { Searchbar } from 'react-native-paper';
import Player from './components/player';
import MasonryList from '@react-native-seoul/masonry-list';

import Constants from 'expo-constants';
import {
  API_KEY,
  BASE_URL,
  TRENDING,
  SEARCH,
  RATING,
  PAGE_SIZE,
  LIGHT,
  DARK,
  WHITE,
  BLACK,
  DEBOUNCE_DELAY_TIME
} from './constants/constant';
import debounce from './utils/debounce';

const windowWidth = Dimensions.get('window').width;

const widthRatio = windowWidth / 360;


function App(props) {
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [offSet, setOffSet] = useState(0);
  const [totalCount, setTotalCount] = useState(Infinity);
  
  
  
  const renderItem = useCallback(({ item }) => {
    return <Player {...item} />;
  }, []);

  const searchAPICall = useCallback(function (searchText) {
  
    const trendingOrSearch = searchText === '' ? TRENDING : SEARCH;
    const url = `${BASE_URL}${trendingOrSearch}?api_key=${API_KEY}&limit=${PAGE_SIZE}&rating=${RATING}&offset=${offSet}&q=${searchText}`;
   
    fetch(url)
      .then((res) => res.json())
      .then((response) => {
        setTotalCount(response.pagination.total_count);
        const curr_data = response.data.map((item, index) => {
          const { width, height } = item.images.original;
          return {
            id: item.id,
            width: 160 * widthRatio,
            height: 160 * (height / width) * widthRatio,
            key: offSet * PAGE_SIZE + index,
          };
        });
        setData(curr_data)
      });
  });

  const themeToggler = useCallback(
    () => {
      const iconUrl = darkModeEnabled ? LIGHT: DARK ;
      return <View style={{marginLeft: 10, position: 'absolute', top: 5, right: 5}}>
                <Pressable onPress={()=>setDarkModeEnabled(!darkModeEnabled)}>
                  <Image source={{uri:iconUrl}} style={{width: 45, height: 45}}/>
                </Pressable>
            </View>;
    },
    [darkModeEnabled]
  );
  
  const debouncedSearchAPICall = useCallback(
    debounce(searchAPICall, DEBOUNCE_DELAY_TIME)
  ,[]);
  

  useEffect(() => {
  
    const trendingOrSearch = searchText === '' ? TRENDING : SEARCH;
    if (offSet !== 0 && offSet < totalCount) {
      const url = `${BASE_URL}${trendingOrSearch}?api_key=${API_KEY}&limit=${PAGE_SIZE}&rating=${RATING}&offset=${offSet}&q=${searchText}`;
     
      fetch(url)
        .catch((e) => {
          
          setOffSet((offSet) => offSet - PAGE_SIZE)
          
        })
        .then((res) => res.json())
        .then((response) => {
          if (response.pagination.total_count != totalCount) {
            setTotalCount(response.pagination.total_count);
          }
          const curr_data = response.data.map((item, index) => {
            const { width, height } = item.images.original;
            return {
              id: item.id,
              width: 160 * widthRatio,
              height: 160 * (height / width) * widthRatio,
              key: offSet + index,
            };
          })
          setData((data) => [...data, ...curr_data]);
        });
    }
  }, [offSet]);

  useEffect(() => {
    if (offSet != 0) setOffSet(0);
    setData([])
    debouncedSearchAPICall(searchText);
    
  }, [searchText]);
  

  
  return (
  <>
  <StatusBar StatusBarStyle={darkModeEnabled ? WHITE : BLACK} />
  <View style={[styles.container, {backgroundColor: darkModeEnabled ? BLACK : WHITE }]}>
      <View style={{flexDirection: 'row', justifyContent: 'flex-start', marginLeft: 10}}>
        <View style={{ height: 75, width: windowWidth - 70 }}>
          <Searchbar
            placeholder="Search GIPHY"
            onChangeText={(text) => {
              setSearchText(text);
            }}
            style={[styles.searchBar, {
              backgroundColor: 'grey',
              color: 'white',
            }]}
            value={searchText}
          />
        </View>
        {themeToggler()}
      </View>
      <MasonryList
        data={data}
        keyExtractor={(item)=> item.key}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        onEndReached={() => setOffSet((index) => index + PAGE_SIZE)}
      />
    </View>
  </>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight + 10,
    padding: 5,
  },
  searchBar:{
    borderRadius:20
  }
});

export default App;
