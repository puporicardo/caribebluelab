import { useEffect, useState } from 'react';
import { getEstadoMar, getLluviaMensual, type EstadoMar, type LluviaMensual } from '../shared/granFaro';

export interface Carga<T> {
  data: T | null;
  loading: boolean;
}

/** Pide una fuente al montar; si falla, queda sin datos y el panel lo dice. */
function useCarga<T>(pedir: (signal: AbortSignal) => Promise<T>): Carga<T> {
  const [carga, setCarga] = useState<Carga<T>>({ data: null, loading: true });

  useEffect(() => {
    const ctrl = new AbortController();
    pedir(ctrl.signal)
      .then((data) => setCarga({ data, loading: false }))
      .catch(() => {
        if (!ctrl.signal.aborted) setCarga({ data: null, loading: false });
      });
    return () => ctrl.abort();
  }, [pedir]);

  return carga;
}

/** Mar y lluvia por separado: si una fuente falla, la otra se ve igual. */
export function useGranFaro(): { mar: Carga<EstadoMar>; lluvia: Carga<LluviaMensual> } {
  return { mar: useCarga(getEstadoMar), lluvia: useCarga(getLluviaMensual) };
}
