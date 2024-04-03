<script>
  import { onMount } from 'svelte';
  import Coookies from 'js-cookie';

  let state = 'login'; // 'login', 'driver', 'passenger', 'passengerConfirmation'
  let username = '';
  let password = '';
  let token = Coookies.get('token') || '';
  let driver = Coookies.get('driver');
  let route = Coookies.get('route') || '';
  let home = Coookies.get('home') || '';
  let spz = Coookies.get('spz') || '';
  let stations = [];
  let selectedStation = '';
  let selectedTime = '7:00'; // default time selection

  onMount(async () => {
    if (token && driver) {
      state = driver === '1' ? 'driver' : 'passenger';
      if (state === 'driver') {
        await getTimes();
      } else {
        await getPassengerOptions();
      }
    }
  });

  async function handleLogin() {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    });

    const data = await response.json();

    if (response.ok) {
      Coookies.set('token', data.token);
      Coookies.set('driver', data.driver);
      Coookies.set('route', data.route);
      Coookies.set('home', data.home);
      Coookies.set('spz', data.spz);
      token = data.token;
      driver = data.driver;
      route = data.route;
      home = data.home;
      spz = data.spz;

      state = driver === '1' ? 'driver' : 'passenger';
      if (state === 'driver') {
        await getTimes();
      } else {
        await getPassengerOptions();
      }
    } else {
      console.error('Login failed:', data.message || 'Unknown error');
    }
  }

  async function getTimes() {
    const response = await fetch(`/gymcar/gettime?route=${route}`, {
      method: 'GET',
    });
    
    if (response.ok) {
      const data = await response.json();
      stations = data.stations;
    } else {
      console.error('Failed to fetch times');
    }
  }

  async function setTimes() {
    for (let station of stations) {
      const response = await fetch('/setTime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `station=${station}&time=${selectedTime}&spz=${spz}&token=${token}`
      });

      if (!response.ok) {
        console.error('Failed to set time for station', station);
        return;
      }
    }
    state = 'driverConfirmation';
  }

  async function getPassengerOptions() {
    const response = await fetch(`/getPassengers?home=${home}`, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      stations = data;
    } else {
      console.error('Failed to fetch passenger options');
    }
  }

  async function setPassenger() {
    const response = await fetch('/setPassenger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `spz=${selectedStation.spz}&time=${selectedStation.time}&token=${token}`
    });

    if (response.ok) {
      state = 'passengerConfirmation';
      selectedTime = selectedStation.time;
      selectedSpz = selectedStation.spz;
    } else {
      console.error('Failed to set passenger');
    }
  }

  async function removePassenger() {
    const response = await fetch('/remPassenger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `spz=${selectedSpz}&token=${token}`
    });

    if (response.ok) {
      state = 'passenger';
      await getPassengerOptions();
    } else {
      console.error('Failed to remove passenger');
    }
  }
</script>

<!-- Login -->
{#if state === 'login'}
  <h2>Login</h2>
  <form on:submit|preventDefault={handleLogin}>
    <input type="text" bind:value={username} placeholder="Username" />
    <input type="password" bind:value={password} placeholder="Password" />
    <button type="submit">Login</button>
  </form>
{:else if state === 'driver'}
  <div>
    <h2>Driver Schedule</h2>
    {#each stations as station}
      <div>
        {station}
        <select bind:value={times[station]}>
          <option value="6:00">6:00</option>
          <option value="6:10">6:10</option>
          <option value="6:20">6:20</option>
          <!-- ... additional options -->
          <option value="7:50">7:50</option>
          <option value="8:00">8:00</option>
        </select>
      </div>
    {/each}
    <button on:click={submitDriverTimes}>Submit</button>
  </div>
{:else if state === 'passenger'}
  <div>
    <h2>Passenger View</h2>
    {#each stations as station}
      <div>
        <button on:click={() => selectStation(station)}>
          {station.spz} - {station.time}
        </button>
      </div>
    {/each}
    <button on:click={submitPassengerSelection}>Submit</button>
  </div>
{:else if state === 'passengerConfirmation'}
  <div>
    <h2>Confirmation</h2>
    <p>Scheduled time: {selectedTime}</p>
    <p>Vehicle SPZ: {selectedSpz}</p>
    <button on:click={removePassenger}>Remove</button>
  </div>
{/if}
