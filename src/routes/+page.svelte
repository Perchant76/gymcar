<script>
  
  import { onMount } from 'svelte';
  // @ts-ignore
  import Cookies from 'js-cookie'; // For URL encoding
  import {get, writable} from "svelte/store";
  import { persisted } from 'svelte-persisted-store'

  let username = '';
  let password = '';
  let token = persisted('token', '');
  // @ts-ignore
  let driver = persisted('driver', '');
  // @ts-ignore
  let home = persisted('home', ''); // Assuming 'home' is part of login response
  let spz = persisted('spz', '');
  let incar = persisted('incar', '');
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
    const response = await fetch('https://6api.perchant.dev/asdf/login/', {
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

  async function getTimes() {
    const response = await fetch(`https://6api.perchant.dev/asdf/gettime/index.php?route=${$route}`);
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

    for (let field of formData.entries()) {
        // Splitting the key into index and station name, assuming the format is 'index_stationName'
        const [index, stationName] = field[0].split('_');
        const time = field[1];
        stations.push({ index, stationName, time });
    }

    const responses = await Promise.all(stations.map(async (station) => {
        const response = await fetch('https://6api.perchant.dev/asdf/settime/index.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                // If your token is in a variable, ensure to include it correctly here
                // Assuming $token is accessible
            },
            // Adjusting to send station name, time, and potentially other needed information
            body: `station=${encodeURIComponent(station.stationName)}&time=${encodeURIComponent(station.time)}&spz=${encodeURIComponent($spz)}`,
        });

        const responseData = await response.json();
        if (!response.ok) {
            throw new Error('Failed to set time for station ' + station.stationName + ': ' + (responseData.message || 'Unknown error'));
        }
        return responseData;
    }));

    // After all requests
    console.log('All times set successfully:', responses);
}
  // @ts-ignore
  async function getPassengers() {
    const response = await fetch('https://6api.perchant.dev/asdf/getPassenger/index.php',{
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({'home':$home})
  });
        
    const data = await response.json();
    console.log(data.stations);
    return  data
  };

  // @ts-ignore
  async function setPassengers(spz, time) {
    const data = { spz: spz, token: $token };
    incar.set('1');
    times.set(time)
    const response = await fetch('https://6api.perchant.dev/asdf/setPassenger/index.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `spz=${data.spz}&token=${data.token}`
    });

    const responseData = await response.json();

    if (responseData.success) {
      // Update UI to display selected passenger and time
    } else {
      // Handle error setting passenger
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
  <h2>Login</h2>
  <form on:submit|preventDefault={handleLogin}>
    <input name="username" type="text" bind:value={username} placeholder="Username" />
    <input name="password" type="password" bind:value={password} placeholder="Password" />
    <button type="submit">Login</button>
  </form>
  {:else if $driver == '1'}
  <h2>Welcome </h2>
    <h3>Set Times</h3>
    {#await getTimes()}
      <p>Loading</p>
    {:then stations } 
    <form on:submit|preventDefault={setTimes}>
      {#each stations.stations as station, i}
        <label for={"selectTime"+ i}>{station}</label>
        <select id={"selectTime"+i} name={i +'_'+ station} >
          <option value="7:00">7:00</option>
          <option value="7:10">7:10</option>
          <option value="7:20">7:20</option>
          <option selected value="7:30">7:30</option>
          <option value="7:40">7:40</option>
          <option value="7:50">7:50</option>
          <option value="8:00">8:00</option>
        </select>
        {/each}
        <button type="submit" >
          Submit Times
        </button>
    </form>
    {/await}
  {:else if $driver == '0'}
    <h3>Set Passenger</h3>
    {#if $incar == '1'}
      <p>You are already in car</p>
      <h2>{$times}</h2>
      {:else}

    <ul>
      {#await getPassengers()}
        <p>Loading passengers...</p>
      {:then passengers }
        <h1>{$home}</h1>
          {#each passengers as passenger }
            <li>
              {passenger.spz} - {passenger.time}
              <button on:click={() => setPassengers(passenger.spz, passenger.time)}>
                Select
              </button>
            </li>
          {/each}
      {:catch error }
        <p>Error fetching passengers: {error.message}</p>
      {/await}
    </ul>
    {/if}
{/if}
