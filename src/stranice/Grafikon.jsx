import Chart, { Colors } from 'chart.js/auto';
import { createSignal, onMount } from 'solid-js';
import { UseAuth } from '../components/AuthProvider';
import { supabase } from '../servisi/supabase';
import { odabirRaspona, rasponOdabir, rasponDatum, setRasponOdabir, resetRaspon, trenutniDatum, setTrenutniDatum } from "../servisi/raspon";
import { valuta } from '../App';
import { getMonth, getYear } from 'date-fns';

//raspone deti u servise pod odabirRaspoa.js i tak spojit grafiko i prikaz troskova

export default function Grafikon() {

    const session = UseAuth()

    const [costData, setCostData] = createSignal([])
    const [budget, setBudget] = createSignal()
    const [budgetDate, setBudgetDate] = createSignal()

    let ctx;
    let chart;

    async function loadExpenses() {
        if (!rasponDatum()) {
            var { data, error } = await supabase
                .from('Troskovi')
                .select('kolicina, vrsta_troska')
                .eq('author_id', session().user.id)
        } else {
            var { data, error } = await supabase
                .from('Troskovi')
                .select('kolicina, vrsta_troska')
                .eq('author_id', session().user.id)
                .gte('datum_troska', rasponDatum()[0])
                .lte('datum_troska', rasponDatum()[1])
        }
        if (error) {
            alert("Dogodila se greška, pokušajte ponovo :(")
        } else {
            for (let i = 0; i < data.length; i++) {
                let { data: data2, error2 } = await supabase
                    .from('Vrste_troskova')
                    .select('*')
                    .eq('id', data[i].vrsta_troska);
                data[i].vrsta_troska = data2[0].ime
                data[i].boja = data2[0].boja
                data[i].budzet = data2[0].mjesecni_budzet
            }
            for (let i = 0; i < data.length; i++) {
                for (let j = i + 1; j < data.length; j++) {
                    if (data[i].vrsta_troska == data[j].vrsta_troska) {
                        data[i].kolicina += data[j].kolicina
                        data.splice(j, 1)
                    }
                }
            }
            setCostData(data)
            if (!budget() || rasponOdabir() == "Mjesec") {
                setBudget(data)
                setBudgetDate(document.getElementById("raspon1").value)
            }
            createChart()
        }
    }

    function createChart() {
        if (chart) {
            chart.destroy()
        }
        chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: costData().map(row => row.vrsta_troska),
                datasets: [
                    {
                        label: 'Kolicina',
                        data: costData().map(row => row.kolicina),
                        backgroundColor: costData().map(Colors => Colors.boja)
                    }
                ]
            }
        });
    }

    onMount(async () => {
        resetRaspon()
        await loadExpenses()
        createChart()
    })

    return (
        <>
            <div class="flex flex-row">

                <div class="w-1/2 items-center">
                    <div class="m-5 text-2xl text-center">Odaberite raspon grafikona</div>
                    <div class="text-center">
                        <select class="select select-bordered w-full max-w-xs m-" id="odabirRaspona" onchange={async () => { await setRasponOdabir(document.getElementById("odabirRaspona").value); await odabirRaspona(); loadExpenses() }}>
                            <option selected>Mjesec</option>
                            <option>Godina</option>
                            <option>Tjedan</option>
                            <option>Dan</option>
                            <option onclick={async () => { await odabirRaspona(); loadExpenses() }}>Svi troškovi</option>
                            <option>Prilagođeni raspon</option>
                        </select>
                        <Show when={rasponOdabir() != "Svi troškovi"}>
                            <input type="date" id="raspon1" class="input input-bordered w-full max-w-xs m-2" value={trenutniDatum()} onchange={async () => { await odabirRaspona(); loadExpenses(); setTrenutniDatum(document.getElementById("raspon1").value) }} />
                        </Show>
                        <Show when={rasponOdabir() == "Prilagođeni raspon"}>
                            <input type="date" id="raspon2" class="input input-bordered w-full max-w-xs m-2" onchange={async () => { await odabirRaspona(); loadExpenses() }} />
                        </Show>
                    </div>
                    <div class="w-full mt-10"><canvas ref={ctx} id="acquisitions" class="w-3/4 pl-0 pr-0 block ml-auto mr-auto"></canvas></div>
                </div>

                <div class="w-1/2">
                    <div class="m-5 text-2xl text-center">Mjesečni budžeti ({getMonth(budgetDate())+1}. mjesec {getYear(budgetDate())}.)</div>
                    <table class="table text-center">
                        <thead>
                            <tr>
                                <th>Ime</th>
                                <th>Mjesečni budžet</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <For each={budget()}>
                                {(item) =>
                                    <Show when={item.budzet}>
                                        <tr>
                                        <td class="flex flex-col items-center"><div style={`background-color: ${item.boja}`} class="p-2 rounded-2xl flex-none">{item.vrsta_troska}</div></td>
                                        <td>{item.budzet} <Show when={item.budzet} fallback={"/"}>{valuta()}</Show></td>
                                        <td><progress class="progress progress-info w-56" value={item.kolicina} max={item.budzet}></progress></td>
                                    </tr>
                                    </Show>
                                }
                            </For>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}