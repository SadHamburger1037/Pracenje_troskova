import Chart, { Colors } from 'chart.js/auto';
import { createEffect, createSignal, onMount } from 'solid-js';
import { UseAuth } from '../components/AuthProvider';
import { supabase } from '../servisi/supabase';


export default function Grafikon() {

    const session = UseAuth()

    const [costData, setCostData] = createSignal([])

    let ctx;

    async function loadExpenses() {
        let { data, error } = await supabase
            .from('Troskovi')
            .select('kolicina, vrsta_troska')
            .eq('author_id', session().user.id)
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
            for(let i = 0; i < data.length; i++){
                for(let j = i+1; j < data.length; j++){
                    if (data[i].vrsta_troska == data[j].vrsta_troska){
                        data[i].kolicina += data[j].kolicina
                        data.splice(j, 1)
                    }
                }
            }
            setCostData(data)
        }
    }


    const data = [
        { year: 2010, count: 10 },
        { year: 2011, count: 20 },
        { year: 2012, count: 15 },
        { year: 2013, count: 25 },
        { year: 2014, count: 22 },
        { year: 2015, count: 30 },
        { year: 2016, count: 28 },
    ];



    onMount(async () => {
        await loadExpenses()
        console.log(costData());
        const chart = new Chart(ctx, {
            type: 'pie',
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
    })

    return (
        <>
            <div class="w-full flex m-10"><canvas ref={ctx} id="acquisitions" class="max-w-150 max-h-180"></canvas></div>
        </>
    )
}