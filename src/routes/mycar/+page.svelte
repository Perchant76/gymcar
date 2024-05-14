<script>
  import "../../app.css";
  import { onMount } from 'svelte';
  import Cookies from 'js-cookie';
  import { get, writable } from "svelte/store";
  import { persisted } from 'svelte-persisted-store';
  let username = '';
  let password = '';
  let token = persisted('token', '');
  let driver = persisted('driver', '');
  let home = persisted('home', '');
  let spz = persisted('spz', '');
  let incar = writable([]); // Updated to default to an empty array
  let times = persisted('times', '');
  let route = persisted('route', '');

  onMount(() => {
      fetchInCarData();
  });

  async function fetchInCarData() {
      const response = await fetch(`https://6api.gymcar.pro/asdf/getincar/index.php`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `spz=${encodeURIComponent(get(spz))}`
      });

      if (response.ok) {
          const data = await response.json();
          incar.set(data.data); // Store the data in the incar store
      } else {
          console.error('Failed to fetch data:', response.status);
          incar.set([]); // Set to empty array if there's an error
      }
  }

  async function logOut(){
      home.set('');
      token.set('');
      spz.set('');
      route.set('');
      driver.set('');
      window.location.href = "/";
  }
</script>

<body class="text-white bg-zinc-900">
  <div class="flex justify-center">
      <img class="w-28" src="/logo.png" alt="Logo">
  </div>
  <h1 class="flex justify-center text-5xl">GYMCAR</h1>
  <h2 class="flex justify-center text-4xl">In Car</h2>

  <!-- Display incar data -->
  <div class="flex justify-center mt-5">
      {#if $incar.length > 0}
          <ul>
              {#each $incar as item}
                  <li>{item.username} - {item.home} - {item.phone_number}</li>
              {/each}
          </ul>
      {:else}
          <p>No data available for the specified SPZ.</p>
      {/if}
  </div>

  <p class="flex justify-center text-gray-600">Made with 💚 by GymCar</p>
  <div class="flex justify-center py-2">
      <button class="text-lime-700" on:click={logOut}>
          Log Out
      </button>
  </div>
</body>
