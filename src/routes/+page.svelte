<script>
    import "../app.css";
  import { onMount } from 'svelte';
  // @ts-ignore
  import Cookies from 'js-cookie'; // For URL encoding
  import {get, writable} from "svelte/store";
  import { persisted } from 'svelte-persisted-store'
  import { redirect } from '@sveltejs/kit';

  let username = '';
  let password = '';
  let token = persisted('token', '');
  // @ts-ignore
  let driver = persisted('driver', '');
  // @ts-ignore
  let home = persisted('home', ''); // Assuming 'home' is part of login response
  let spz = persisted('spz', '');
  let incar = persisted('incar', '');
  let selectNumber = '1';
  let times = persisted('times', '');
  let route = persisted('route', '');
  let stations = [];
    // @ts-ignore


  async function handleLogin(e) {
    // @ts-ignore
    const formData = new FormData(e.target);
    const urlData = {}
    for (let field of formData) {
			const [key, value] = field
			urlData[key]= value
    }
    const response = await fetch('https://6api.gymcar.pro/asdf/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams(urlData)

    });

    const data = await response.json();
    if (data.token) {
      token.set(data.token)
      driver.set(data.driver)
      home.set(data.home); // Assuming 'home' is part of login response
      spz.set(data.spz);
      route.set(data.route);// Assuming 'spz' is part of login response
      await getTimes(); // Fetch times after successful login
    } else {
      // Handle login error
      console.error('Login failed:', data.message || 'Unknown error');
    }
  }
  
  function handleSubmit(event) {
        
    }


  async function getTimes() {
    const response = await fetch(`https://6api.gymcar.pro/asdf/gettime/index.php?route=${$route}`);
    const data = await response.json();
      return data
    if (data.success) {
      stations = data.stations;
    } else {
      // Handle error fetching times
      console.error('Failed to get times:', data.message || 'Unknown error');
    }
  }

  // @ts-ignore
  async function setTimes(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const stations = [];
        // Extract stations and times from the form data
        for (let field of formData.entries()) {
            const [index, stationName] = field[0].split('_');
            const time = field[1];
            stations.push({ index, stationName, time });
        }

        // Send a POST request for each station with the necessary data
        const responses = await Promise.all(stations.map(async (station) => {
            const response = await fetch('https://6api.gymcar.pro/asdf/settime/index.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                // Encode and concatenate all necessary parameters into the request body
                body: `station=${encodeURIComponent(station.stationName)}&time=${encodeURIComponent(station.time)}&spz=${encodeURIComponent($spz)}&incar=${encodeURIComponent(selectNumber)}&token=${encodeURIComponent($token)}`,
            });

            const responseData = await response.json();
            // Handle response appropriately
            if (!response.ok) {
                throw new Error('Failed to set time for station ' + station.stationName + ': ' + (responseData.message || 'Unknown error'));
            }
            return responseData;
        }));
        window.location.href = '/mycar';
        // Log the response from the server for all stations
        console.log('All times set successfully:', responses);
    }
  // @ts-ignore
  async function getPassengers() {
    const response = await fetch('https://6api.gymcar.pro/asdf/getPassenger/index.php',{
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({'home':$home})
  });
        
    const data = await response.json();
    console.log(data.stations);
    return  data
  };
  async function remPassenger(){
    incar.set('0');
    times.set('');
  }
  async function logOut(){
    home.set('')
    token.set('')
    spz.set('')
    route.set('')
    driver.set('')
  }
  // @ts-ignore
  async function setPassengers(spz, time) {
    const data = { spz: spz, token: $token, home: $home};
    incar.set('1');
    times.set(time)
    const response = await fetch('https://6api.gymcar.pro/asdf/setincar/index.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `spz=${data.spz}&token=${data.token}&home=${data.home}`
    });

    const responseData = await response.json();

    if (responseData.success) {
      // Update UI to display selected passenger and time
    } else {
      // Handle error setting passenger
      incar.set('0')
      alert('Auto je plné')
      console.error('Failed to set passenger:', responseData.message || 'Unknown error');
    }
  }

  onMount(async () => {
    // @ts-ignore
    username = get('username') || '';
    // @ts-ignore
    password = get('password') || '';

    if (token) {
      await getTimes(); // Fetch times on initial load if logged in
    }
  });
</script>

{#if $token == '' }
  <br>
    <div class="flex justify-center ">
    <img class="w-28" src="/logo.png" alt="Logo">
  </div>
  <br>
  <br>
  <br>
  <h1 class="flex justify-center text-5xl text-white">GYMCAR</h1>
  <br>
  <br>
  <br>
  <h2 class="flex justify-center text-4xl text-white">Login</h2>
  <br>
  <br>
  <br>
  <form class="flex flex-col px-10 sm:px-96" on:submit|preventDefault={handleLogin}>
    <input class="block w-full px-3 py-4 mt-1 text-white bg-black border rounded-md shadow-sm border-lime-300 placeholder-lime-100 focus:outline-none focus:placeholder-lime-700 focus:ring-lime-700 sm:text-sm focus:ring-1" name="username" type="text" bind:value={username} placeholder="Username" />
    <br>
    <br>
    <br>
    <input class="block w-full px-3 py-4 mt-1 text-white bg-black border rounded-md shadow-sm border-lime-300 placeholder-lime-100 focus:outline-none focus:placeholder-lime-700 focus:ring-lime-700 sm:text-sm focus:ring-1" name="password" type="password" bind:value={password} placeholder="Password" />
    <br>
    <br>
    <br>
    <button class="flex justify-center px-3 py-1 text-white rounded bg-lime-700" type="submit">Login</button>
  </form>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <p class="flex justify-center text-gray-500">Made with 💚 by Gymcar</p>
  <br>
  {:else if $driver == '1'}
  <img src="/" alt="">
  <br>
  <br>
    <div class="flex justify-center ">
    <img class="w-20" src="/logo.png" alt="Logo">
  </div>
  <h1 class="flex justify-center py-5 text-5xl text-white">Vitaj Vodič </h1>
  <br>
    <h3 class="flex justify-center text-4xl text-white">Nastav čas</h3>
    <br>
    <br>
    <p class="flex justify-center px-5 text-white">V tejto časti ku každej zastávke cez ktorú prechádzaš pridaj čas, počas ktorého budeš prechádzať cez toto miesto</p>
    <br>
    {#await getTimes()}
      <p>Loading</p>
    {:then stations } 
    <br>
    <br>
    <br>
    <form on:submit|preventDefault={setTimes}>
      <div class="flex justify-center px-3 text-3xl">
        <h2 class="px-4 text-white">Koľko máš volných miest</h2>
        <select name="numberSelect" bind:value={selectNumber}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </div>
      <br>
      <br>
      {#each stations.stations as station, i}
        <ul class="flex justify-center text-3xl">
          <label class="px-3 text-white " for={"selectTime"+ i}>{station}</label>
          <select id={"selectTime"+i} name={i +'_'+ station} >
            <option value="6:00">6:00</option>
            <option value="6:10">6:10</option>
            <option value="6:20">6:20</option>
            <option value="6:30">6:30</option>
            <option value="6:40">6:40</option>
            <option value="6:50">6:50</option>
            <option value="7:00">7:00</option>
            <option value="7:10">7:10</option>
            <option value="7:20">7:20</option>
            <option value="7:30">7:30</option>
            <option value="7:40">7:40</option>
            <option value="7:50">7:50</option>
            <option value="8:00">8:00</option>
            <option value="8:10">8:10</option>
            <option value="8:20">8:20</option>
            <option value="8:30">8:30</option>
            <option value="8:40">8:40</option>
            <option value="8:50">8:50</option>
            <option value="9:00">9:00</option>
          </select>
        </ul>
        <br>
        {/each}
        <br>
        <dir class="flex justify-center" >
          <button class="px-3 py-1 text-2xl text-white rounded bg-lime-700" type="submit" >
            Pridať čas
          </button>
        </dir>
        <br>
        <br>
        <br>
        <p class="flex justify-center text-gray-600">Made with 💚 by GymCar</p>
        <div class="flex justify-center py-2 text-xl rounded text-lime-700">
          <button on:click={logOut}>Log Out</button>
        </div>
        <br>
        <br>
    </form>
    {/await}
  {:else if $driver == '0'}
  <br>
  <br>
  <br>
  <br>
    <div class="flex justify-center ">
    <img class="w-20" src="/logo.png" alt="Logo">
  </div>
  <br>
    <h1 class="flex justify-center text-5xl text-white">Vyber si auto</h1>
    {#if $incar == '1'}
    <br>
      <h1 class="flex justify-center text-2xl text-white">Tvoje auto bude na zastávke o:</h1>
      <br>
      <h2 class="flex justify-center text-white text-7xl">{$times}</h2>
      <br>
      <br>
      <div class="flex justify-center">
        <button class="px-3 py-1 text-white rounded bg-lime-700" on:click={() => remPassenger()}>
          Nechcem odviesť
        </button>
      </div>
      {:else}

    <ul>
      {#await getPassengers()}
        <p class="flex justify-center text-white text-7xl">Loading passengers...</p>
      {:then passengers }
      <br>
      <br>
        <h1 class="flex justify-center text-3xl text-white">{$home}</h1>
        <p class="flex justify-center text-white">Tu si môžeš vybrať ktorým autom pôjdeš na základe času, ktorý ti vyhovuje, šoferá spoznáš podľa ŠPZ</p>
        <br>
          {#each passengers as passenger }
            <li class="flex justify-center px-5 py-6 text-3xl text-white">
              {passenger.spz} - {passenger.time} - {passenger.number}
              <button class="px-3 py-1 text-white rounded bg-lime-700" on:click={() => setPassengers(passenger.spz, passenger.time)}>
                Vybrať
              </button>
            </li>
            <br>
          {/each}
          <br>
          <br>
          <br>
          <br>
          <p class="flex justify-center text-gray-700">Made with 💚 by GymCar</p>
          <div class="flex justify-center py-2 text-xl rounded text-lime-700">
            <button on:click={logOut}>Log Out</button>
          </div>
          <br>
          <br>

      {:catch error }
        <p>Error fetching passengers: {error.message}</p>
      {/await}
    </ul>
    {/if}
{/if}
