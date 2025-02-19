import Chart, { Colors } from 'chart.js/auto';
import { createSignal, onMount } from 'solid-js';
import { UseAuth } from '../components/AuthProvider';
import { supabase } from '../servisi/supabase';
import { odabirRaspona, rasponOdabir, rasponDatum, setRasponOdabir, resetRaspon } from "../servisi/raspon";

//raspone deti u servise pod odabirRaspoa.js i tak spojit grafiko i prikaz troskova

export default function Grafikon() {

    const session = UseAuth()

    const [costData, setCostData] = createSignal([])

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
            createChart()
        }
    }

    function createChart(){
        if (chart){
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
            <div>
                <div class="m-2 text-xl">Odaberite raspon</div>
                <select class="select select-bordered w-full max-w-xs m-2" id="odabirRaspona" onchange={async () => {await setRasponOdabir(document.getElementById("odabirRaspona").value); odabirRaspona(); loadExpenses()}}>
                    <option selected>Mjesec</option>
                    <option>Godina</option>
                    <option>Tjedan</option>
                    <option>Dan</option>
                    <option onclick={async () => { await odabirRaspona(); loadExpenses() }}>Svi troškovi</option>
                    <option>Prilagođeni raspon</option>
                </select>
                <Show when={rasponOdabir() != "Svi troškovi"}>
                    <input type="date" id="raspon1" class="input input-bordered w-full max-w-xs m-2" onchange={async () => { await odabirRaspona(); loadExpenses() }} />
                </Show>
                <Show when={rasponOdabir() == "Prilagođeni raspon"}>
                    <input type="date" id="raspon2" class="input input-bordered w-full max-w-xs m-2" onchange={async () => { await odabirRaspona(); loadExpenses() }} />
                </Show>
            </div>
            <div class="w-full flex m-10"><canvas ref={ctx} id="acquisitions" class="max-w-150 max-h-180"></canvas></div>
        </>
    )
}