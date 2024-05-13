<script>
      import "../../app.css";
  import { onMount } from 'svelte';
  // @ts-ignore
  import Cookies from 'js-cookie'; // For URL encoding
  import {get, writable} from "svelte/store";
  import { persisted } from 'svelte-persisted-store'

</script>
<body class="text-white bg-zinc-900">
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
  <h2 class="flex justify-center text-4xl text-white">In Car</h2>
  <br>
  <br>
  <br>
  <div class="flex justify-center">
    <div class="flex flex-col text-3xl">
      <div class="flex justify-normal">
        <button class="flex px-4 py-2 rounded-md bg-lime-700">X</button>
        <h3>1. Marek Čierny - 09513235111</h3>
      </div>
    <div class="flex justify-normal">
      <button class="flex px-4 py-2 rounded-md bg-lime-700">X</button>
      <h3>2. Alexandra Marečková - 09513225151</h3>
    </div>
    <div class="flex justify-normal">
      <button class="flex px-4 py-2 rounded-md bg-lime-700">X</button>
      <h3>3. Marek Čierny - 09513235111</h3>
    </div>
    <div class="flex justify-normal">
      <button class="flex px-4 py-2 rounded-md bg-lime-700">X</button>
      <h3 >2. Alexandra Marečková - 09513225151</h3>
    </div>
    <h3>4. </h3>  
    </div>  
  </div>
  
</body>