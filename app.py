# Importazione delle librerie flask
# Flask:Non e altro che una micro-framework di Python per la creazione di applicazioni web.
#  Viene utilizzato per gestire le rotte e servire le API.
# request: Si tratta di un oggetto di Flask che rappresenta i dati della richiesta HTTP.
# Viene utilizzato per accedere ai dati inviati dal client (es. i dati del form o il payload JSON).
# jsonify: Una funzione che trasforma i dati Python (es. liste, dizionari) in formato JSON,
# per poterli inviare come risposta al client.
# CORS: Aggiunge supporto per Cross-Origin Resource Sharing. È necessario per permettere alle risorse della tua API di
# essere richieste da un dominio diverso, come quello su cui potrebbe essere ospitata la tua applicazione frontend.
from flask import Flask, request, jsonify
from flask_cors import CORS

# qui viene creata l'istanza di flask, quest'ultima sarà necessaria per la definizione delle rotte.
app = Flask(__name__)
# CORS invece abilita il supporto CORS per l'app Flask, il che consente richieste da domini diversi.
# Questo è utile se l'interfaccia frontend si trova su un dominio diverso rispetto all'API.
CORS(app)

# Qui abbiene una simulazione di un database di lezioni, ogni lezione è un dizionario con un ID, un nome,
# e un orario.
lessons = [
    {"id": 1, "name": "Yoga", "time": "10:00"},
    {"id": 2, "name": "total body,", "time": "12:00"},
    {"id": 3, "name": "Pilates", "time": "14:00"},
    {"id": 4, "name": "Sala pesi con Maurizio", "time": "18:00"},
    {"id": 5, "name": "Aerobica", "time": "18:00"},
    {"id": 6, "name": "Sala pesi con Luca", "time": "19:00"},
    {"id": 7, "name": "Crossfit", "time": "20:00"},
]

# Lista che memorizzerà le prenotazioni  effettuate dagli utenti.
# Quando viene fatta una prenotazione, viene aggiunta a questa lista.
reservations = []


# Rotta per passare il dizionario delle lezione al frontend
# Questa definisce una rotta HTTP che risponde alle richieste GET. Quando un client fa una richiesta GET a /api/lessons,
# questa funzione viene eseguita.
@app.route('/api/lessons', methods=['GET'])
def get_lessons():
    return jsonify(lessons)  # Qui restituisco al front il dionario


# Rotta per prenotare una lezione.
# Questa definisce una rotta HTTP per le richieste POST alla rotta /api/book, utilizzata per fare una prenotazione.
@app.route('/api/book', methods=['POST'])
def book_lesson():
    # request.json contiene i dati JSON inviati nel body della richiesta POST.
    # Ci si aspetta che questi dati contengano l'ID della lezione,
    # il nome dell'utente, surname, e la data della prenotazione.
    data = request.json  # Inizializzo la variabile data con il request con le informazioni della prenotazione.
    lesson_id = data['lessonId']  # Inizializzo la variabile lesson_id con l'ID del corso scelto.
    name = data['name']  # Inizializzo la variabile name con il nome del corso scelto.
    surname = data['surname']  # Inizializzo la variabile surname con l'surname del corso scelto.
    date = data['date']  # Inizializzo la variabile date con la data del corso scelto.

    # Effettuo un ciclo e un controllo  per valutare l'esistenza del id della lezione,
    # Se trova la lezione, continua; altrimenti, restituisce un errore 404.
    lesson = next((lesson for lesson in lessons if lesson["id"] == int(lesson_id)), None)

    # Se esiste la lezione allora inizio a popolare il mio array di prenotazioni.
    if lesson:
        reservation_id = len(reservations) + 1  # Assegno un ID incrementale per ogni prenotazione
        # Popolamento array reservations con gli oggetti della prenotazione.
        reservations.append({
            "id": reservation_id,  # ID della prenotazione
            "lesson": lesson,
            "name": name,
            "surname": surname,
            "date": date
        })
        # messaggio di successo in caso di prenotazione eseguita.
        return jsonify({"success": True, "message": "Prenotazione avvenuta con successo."})
    else:
        # messaggio di errore in caso di prenotazione fallita per mancanza di id.
        return jsonify({"success": False, "message": "Lezione non trovata."}), 404


# Rotta per ottenere tutte le prenotazioni
@app.route('/api/reservations', methods=['GET'])
def get_reservations():
    return jsonify(reservations)  # Qui restituisco tutte le prenotazioni esistenti come JSON.


# Rotta per cancellare una prenotazione
# Questa definisce una rotta per eliminare una prenotazione specifica, identificata dal suo reservation_id.
# La richiesta DELETE viene effettuata a /api/delete/<reservation_id>.
@app.route('/api/delete/<int:reservation_id>', methods=['DELETE'])
def delete_reservation(reservation_id):
    # Si dichiara la variabile reservations come globale,
    # in modo che possa essere modificata all'interno della funzione.
    global reservations

    # Si filtra la lista delle prenotazioni, rimuovendo quella con l'ID specificato.
    reservations = [res for res in reservations if res["id"] != reservation_id]

    # Risponde con un messaggio di successo.
    return jsonify({"success": True, "message": "Prenotazione cancellata con successo."})


# Rotta per modificare una prenotazione esistente
# Questa definisce una rotta per aggiornare una prenotazione esistente tramite una richiesta PUT.
# Il client specifica l'ID della prenotazione nell'URL.
@app.route('/api/update/<int:reservation_id>', methods=['PUT'])
def update_reservation(reservation_id):
    data = request.json
    lesson_id = data['lessonId']
    name = data['name']
    surname = data['surname']
    date = data['date']

    # Si cerca la prenotazione con l'ID specificato. Se la trova, procede con l'aggiornamento.
    reservation = next((res for res in reservations if res["id"] == reservation_id), None)

    if reservation:
        # Qui cerca la lezione con l'ID fornito. Se la trova,
        # aggiorna la prenotazione con i nuovi dati forniti nel body della richiesta.
        lesson = next((lesson for lesson in lessons if lesson["id"] == int(lesson_id)), None)
        if lesson:
            # Se la condizione si verifica si procede con l'aggiornamento dei dati della prenotazione
            reservation['lesson'] = lesson
            reservation['name'] = name
            reservation['surname'] = surname
            reservation['date'] = date
            return jsonify({"success": True, "message": "Prenotazione aggiornata con successo."})
        else:
            return jsonify({"success": False, "message": "Lezione non trovata."}), 404
    else:
        return jsonify({"success": False, "message": "Prenotazione non trovata."}), 404


# esecuzione dell'app
# Verifica se il file viene eseguito come programma principale. Se sì, l'applicazione Flask viene avviata.
if __name__ == '__main__':
    # Qui si avvia il server di sviluppo di Flask in modalità di debug, permettendo di vedere i messaggi di errore e
    # aggiornare automaticamente il server quando il codice viene modificato.
    app.run(debug=True)
