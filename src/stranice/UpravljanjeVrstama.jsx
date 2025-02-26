import { createEffect, createSignal, Show } from "solid-js"
import { supabase } from "../servisi/supabase"
import { UseAuth } from "../components/AuthProvider"
import { valuta } from "../App"
import { Portal } from "solid-js/web"

export default function UpravljanjeVrstama(props) {

    const session = UseAuth()

    const [vrste, setVrste] = createSignal([])
    const [editVrsta, setEditVrsta] = createSignal([])
    const [showEditVrsta, setShowEditVrsta] = createSignal(false)

    async function prikazVrsta() {
        let { data, error } = await supabase
            .from('Vrste_troskova')
            .select('*')
            .eq('author_id', session().user.id)
        if (error) {
            alert("Dogodila se greška, pokušajte ponovo :(")
        } else {
            setVrste(data)
        }
    }

    async function brisanjeVrste(vrstaID) {
        const { error } = await supabase
            .from('Vrste_troskova')
            .delete()
            .eq('id', vrstaID)
        if (error) {
            alert("Brisanje nije uspijelo")
        } else {
            await prikazVrsta();
        }
    }

    async function formSubmitVrsta(event) {
        event.preventDefault();
        const formData = new FormData(event.target)
        const ime = formData.get("ime")
        const boja = formData.get("boja")
        const budzet = formData.get("budzet")

        const { data, error } = await supabase
            .from('Vrste_troskova')
            .insert([{
                ime: ime,
                boja: boja,
                mjesecni_budzet: budzet,
                author_id: session().user.id
            }])
            .select()
        if (!error) {
            event.target.reset()
            await prikazVrsta()
        } else {
            alert("Spremanje nije uspijelo :(")
        }

    }

    async function formEditVrsta(event) {
        event.preventDefault();
        const formData = new FormData(event.target)
        const VrstaID = formData.get("id")
        const ime = formData.get("ime")
        const boja = formData.get("boja")
        const budzet = formData.get("budzet")

        console.log(budzet);
        

        const { data, error } = await supabase
            .from('Vrste_troskova')
            .update({ 
                ime: ime,
                boja: boja,
                mjesecni_budzet: budzet
             })
            .eq('id', VrstaID)
        if (!error) {
            event.target.reset()
            toggleShowEditVrsta(old => !old)
            await prikazVrsta()
        } else {
            alert("Spremanje nije uspijelo :(")
        }
        console.log(data);
        
    }

    function toggleShowEditVrsta(){
        setShowEditVrsta(old => !old)
        if(showEditVrsta()){
            document.getElementById("ime_edit").value = editVrsta().ime
            document.getElementById("boja_edit").value = editVrsta().boja
            document.getElementById("budzet_edit").value = editVrsta().budzet
        }
    }

    createEffect(async () => {
        await prikazVrsta()
    })

    return (
        <>
            <Show when={showEditVrsta()}>
                <Portal mount={document.querySelector("main")}>
                    <div class="w-1/4 bg-base-100 z-50 relative bottom-100 left-180 rounded-2xl border-4 border-base-300">
                        <form onSubmit={formEditVrsta} class="flex flex-col navbar-center mt-3.5 ">
                            <input type="text" name="ime" id="ime_edit" placeholder={"Unesite ime:"} class="input input-bordered w-full max-w-xs m-2" required="" />
                            <input type="number" name="budzet" id="budzet_edit" step="0.01" min="0.01" placeholder={"Unesite mjesečni budžet:"} class="input input-bordered w-full max-w-xs m-2"/>
                            <input type="color" name="boja" id="boja_edit" class="input input-bordered w-full max-w-xs m-2" required="" />
                            <input type="number" hidden="" id="id_edit" value={editVrsta().id} name="id"/>
                            <button type="submit" class="btn btn-ghost text-xl m-3.5">Unesi</button>
                        </form>
                    </div>
                </Portal>
            </Show>
            <div class="text-3xl text-center mt-10">Upisivanje Vrste</div>
            <form onSubmit={formSubmitVrsta} class="flex flex-col navbar-center mt-10">
                <input type="text" name="ime" placeholder={"Unesite ime:"} class="input input-bordered w-full max-w-xs m-2" required="" />
                <input type="number" name="budzet" step="0.01" placeholder={"Unesite mjesečni budžet:"} class="input input-bordered w-full max-w-xs m-2" min="0.01"/>
                <input type="color" name="boja" class="input input-bordered w-full max-w-xs m-2" required="" />
                <button type="submit" class="btn text-2xl mt-3.5 mb-10">Unesi</button>
            </form>
            <Show when={vrste().length > 0} fallback={
                <div role="alert" class="alert alert-info  m-10">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        class="h-6 w-6 shrink-0 stroke-current">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Nema Vrsta</span>
                </div>
            }>
                <div class="overflow-x-auto">
                    <table class="table text-center">
                        <thead>
                            <tr>
                                <th>Ime</th>
                                <th>Mjesečni budžet</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <For each={vrste()}>
                                {(item) =>
                                    <tr>
                                        <td class="flex flex-col items-center"><div style={`background-color: ${item.boja}`} class="p-2 rounded-2xl flex-none">{item.ime}</div></td>
                                        <td>{item.mjesecni_budzet} <Show when={item.mjesecni_budzet} fallback={"/"}>{valuta()}</Show></td>
                                        <td><button class="btn btn-outline btn-error mr-2" onclick={() => { brisanjeVrste(item.id) }}>Briši</button><button class="btn btn-outline btn-info ml-2" onclick={async () => { await setEditVrsta({ime: item.ime, boja: item.boja, budzet: item.mjesecni_budzet, id: item.id}); toggleShowEditVrsta(true)}}>Uredi</button></td>
                                    </tr>
                                }
                            </For>
                        </tbody>
                    </table>
                </div>
            </Show>
        </>
    )
}