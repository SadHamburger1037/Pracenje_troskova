import { Router, Route, A } from "@solidjs/router";
import NoviTrosak from './stranice/NoviTrosak';
import PrikazTroskova from './stranice/PrikazTroskova';
import { createSignal } from 'solid-js';
import Grafikon from "./stranice/Grafikon"
import UpravljanjeVrstama from './stranice/UpravljanjeVrstama';

export const [valuta, setValuta] = createSignal("EUR")

function App() {
  return (
    <Router root={Root}>
      <Route path="/" component={NoviTrosak} />
      <Route path="/prikaz" component={PrikazTroskova} />
      <Route path="/grafikon" component={Grafikon} />
      <Route path="/vrste" component={UpravljanjeVrstama}/>
    </Router>
  );
}


export function Root(props) {
  return (
    <>
      <div class="navbar bg-base-100 shadow-sm">
        <div class="navbar-start">
          <div class="dropdown dropdown-hover">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" /> </svg>
            </div>
            <ul
              tabindex="0"
              class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow">
              <li><A href='/'>Novi Trosak</A></li>
              <li><A href='/prikaz'>Prikaz Troskova</A></li>
              <li><A href='/grafikon'>Tortni Grafikon</A></li>
              <li><A href='/vrste'>Upravljanje Vrstama</A></li>
            </ul>
          </div>
        </div>
        <div class="navbar-center">
          <A class="btn btn-ghost text-xl" href='/'>Praćenje Troškova</A>
        </div>
        <div class="navbar-end">
          <div class="dropdown dropdown-hover">
            <div tabindex="0" role="button" class="btn m-1 rounded-box">Promjena valute</div>
            <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
              <li><button onclick={() => {setValuta("EUR")}}>EUR</button></li>
              <li><button onclick={() => {setValuta("USD")}}>USD</button></li>
            </ul>
          </div>
        </div>
      </div>

      <div>{props.children}</div>
    </>
  )
}

export default App;
