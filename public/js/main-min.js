let restaurants,neighborhoods,cuisines,map;var markers=[];document.addEventListener("DOMContentLoaded",e=>{fetchNeighborhoods(),fetchCuisines()});const fetchNeighborhoods=()=>{DBHelper.fetchNeighborhoods((e,t)=>{e?console.error(e):(self.neighborhoods=t,fillNeighborhoodsHTML())})},fillNeighborhoodsHTML=(e=self.neighborhoods)=>{const t=document.getElementById("neighborhoods-select");e.forEach(e=>{const n=document.createElement("option");n.innerHTML=e,n.value=e,t.append(n)})},fetchCuisines=()=>{DBHelper.fetchCuisines((e,t)=>{e?console.error(e):(self.cuisines=t,fillCuisinesHTML())})},fillCuisinesHTML=(e=self.cuisines)=>{const t=document.getElementById("cuisines-select");e.forEach(e=>{const n=document.createElement("option");n.innerHTML=e,n.value=e,t.append(n)})};window.initMap=(()=>{self.map=new google.maps.Map(document.getElementById("map"),{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1}),updateRestaurants()});const updateRestaurants=()=>{const e=document.getElementById("cuisines-select"),t=document.getElementById("neighborhoods-select"),n=e.selectedIndex,s=t.selectedIndex,r=e[n].value,a=t[s].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(r,a,(e,t)=>{e?console.error(e):(resetRestaurants(t),fillRestaurantsHTML())})},resetRestaurants=e=>{self.restaurants=[],document.getElementById("restaurants-list").innerHTML="",self.markers.forEach(e=>e.setMap(null)),self.markers=[],self.restaurants=e},fillRestaurantsHTML=(e=self.restaurants)=>{let t=3;const n=document.getElementById("restaurants-list");e.forEach(e=>{n.append(createRestaurantHTML(e,t)),t++}),addMarkersToMap()},createRestaurantHTML=(e,t)=>{const n=document.createElement("li"),s=document.createElement("img");s.className="restaurant-img",s.src=DBHelper.imageUrlForRestaurant(e),s.alt=e.name+" Main Image",n.append(s);const r=document.createElement("h1");r.innerHTML=e.name,n.append(r);const a=document.createElement("p");a.innerHTML=e.neighborhood,n.append(a);const o=document.createElement("p");o.innerHTML=e.address,n.append(o);const l=document.createElement("a");return l.innerHTML="View Details",l.setAttribute("tabs",t.toString()),l.setAttribute("aria-label","View Details for "+e.name),l.href=DBHelper.urlForRestaurant(e),n.append(l),n},addMarkersToMap=(e=self.restaurants)=>{e.forEach(e=>{const t=DBHelper.mapMarkerForRestaurant(e,self.map);google.maps.event.addListener(t,"click",()=>{window.location.href=t.url}),self.markers.push(t)})};