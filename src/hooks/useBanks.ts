import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { BankMaster } from '../models/bank';
import { getBanks, BankApiResponse } from '../utils/api';

interface UseBanksResult {
  banks: BankMaster[];
  setBanks: Dispatch<SetStateAction<BankMaster[]>>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const toStringId = (value: string | number) => value.toString();

function mapBank(apiBank: BankApiResponse): BankMaster {
  return {
    id: toStringId(apiBank.id),
    bankaAdi: apiBank.name,
    kodu: apiBank.accountNo || apiBank.name,
    hesapAdi: apiBank.name,
    iban: apiBank.iban || undefined,
    acilisBakiyesi: apiBank.currentBalance ?? 0,
    aktifMi: apiBank.isActive,
    cekKarnesiVarMi: false,
    posVarMi: false,
    krediKartiVarMi: false,
  };
}

export function useBanks(): UseBanksResult {
  const [banks, setBanks] = useState<BankMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getBanks();
      const mapped = response.map(mapBank);
      setBanks(mapped);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Banka listesi alınamadı';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { banks, setBanks, loading, error, refresh };
}

export default useBanks;
