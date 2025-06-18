import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getTechnicians } from '@/services/employeeService';
import { getClientBuildings } from '@/services/clientService';
import { reserveReportId, saveDraftReport, submitReport } from '@/services/reportService';

export function useServiceReportFormHandlers(clientId?: string) {
  const queryClient = useQueryClient();

  const { data: technicians = [], isLoading: loadingTechnicians } = useQuery(
    'technicians',
    getTechnicians
  );

  const { data: buildings = [], isLoading: loadingBuildings } = useQuery(
    ['buildings', clientId],
    () => getClientBuildings(clientId!),
    { enabled: Boolean(clientId) }
  );

  const reserveIdMutation = useMutation(reserveReportId);
  const saveDraftMutation = useMutation(saveDraftReport, {
    onSuccess: () => queryClient.invalidateQueries('draftReports'),
  });
  const submitMutation = useMutation(submitReport, {
    onSuccess: () => queryClient.invalidateQueries('reports'),
  });

  return {
    technicians,
    loadingTechnicians,
    buildings,
    loadingBuildings,
    reserveId: () => reserveIdMutation.mutateAsync(),
    saveDraft: (data: any) => saveDraftMutation.mutateAsync(data),
    submit: (data: any) => submitMutation.mutateAsync(data),
  };
}