import { OneFullColumn } from '@/components/Layouts/Layouts';
import StopsExplorer from '@/components/StopsExplorer/StopsExplorer';
import { StopsExplorerContextProvider } from '@/contexts/StopsExplorerContext';

/* * */

export async function generateMetadata({ params }) {
  //

  // A. Fetch stop data
  const stopData = await fetch(params.stop_id?.length && `https://api.carrismetropolitana.pt/stops/${params.stop_id}`).then((res) => res.json());

  // B. Render the titles
  if (params.stop_id === 'all' || !stopData.name) {
    switch (params.locale) {
      case 'pt':
        return { title: 'Jogo das Paragens', description: 'Conheça as paragens e horários da Carris Metropolitana' };
      default:
      case 'en':
        return { title: 'Jogo das Paragens', description: 'Conheça as paragens e horários da Carris Metropolitana' };
    }
  } else {
    switch (params.locale) {
      case 'pt':
        return { title: `Jogo das Paragens`, description: 'Conheça as paragens e horários da Carris Metropolitana.' };
      default:
      case 'en':
        return { title: `Jogo das Paragens`, description: 'Conheça as paragens e horários da Carris Metropolitana.' };
    }
  }

  //
}

/* * */

export default function Page() {
  //

  //
  // A. Render components

  return (
    <OneFullColumn>
      <StopsExplorerContextProvider>
        <StopsExplorer />
      </StopsExplorerContextProvider>
    </OneFullColumn>
  );

  //
}
