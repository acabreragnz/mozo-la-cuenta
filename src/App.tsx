import RestaurantIVACalculator from './RestaurantIVACalculator'
import TicketPrototypes from './TicketPrototypes'

function App() {
  // Mostrar prototipos si hay ?proto en la URL
  const showPrototypes = window.location.search.includes('proto')

  return showPrototypes ? <TicketPrototypes /> : <RestaurantIVACalculator />
}

export default App
