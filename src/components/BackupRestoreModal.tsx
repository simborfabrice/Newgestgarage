import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Download,
  Upload,
  HardDrive,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  X,
  Copy,
  Clock,
  Trash2,
  RefreshCw,
  FileText,
  ShieldCheck,
  Wrench,
  Sparkles,
  Users,
  Car,
  Coins,
  Truck,
  Check,
} from 'lucide-react';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import { DataRepairReport } from '../types';

export const BackupRestoreModal: React.FC = () => {
  const {
    isBackupModalOpen,
    setIsBackupModalOpen,
    theme,
    clients,
    vehicles,
    documents,
    appointments,
    cashTransactions,
    supplierOrders,
    catalogItems,
    snapshots,
    createSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    exportBackup,
    downloadBackupFile,
    importBackup,
    repairData,
    lastRepairReport,
    resetAllData,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'snapshots' | 'repair'>('repair');

  // Export tab state
  const [copied, setCopied] = useState(false);

  // Import tab state
  const [importJsonText, setImportJsonText] = useState('');
  const [importFeedback, setImportFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Snapshot form state
  const [newSnapshotName, setNewSnapshotName] = useState('');

  // Repair tab state
  const [repairRunning, setRepairRunning] = useState(false);
  const [currentReport, setCurrentReport] = useState<DataRepairReport | null>(lastRepairReport || null);
  const [repairSuccessBanner, setRepairSuccessBanner] = useState<string | null>(null);

  if (!isBackupModalOpen) return null;

  const handleCopyBackup = () => {
    const json = exportBackup();
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
      try {
        const parsed = JSON.parse(content);
        const clientsCount = parsed.clients?.length ?? 0;
        const docsCount = parsed.documents?.length ?? 0;
        setImportFeedback({
          success: true,
          message: `Fichier analysé avec succès : ${clientsCount} clients, ${docsCount} documents détectés. Cliquez sur « Confirmer et Restaurer ».`,
        });
      } catch (err) {
        setImportFeedback({
          success: false,
          message: 'Le fichier sélectionné n’est pas un fichier JSON de sauvegarde valide.',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (!importJsonText.trim()) {
      alert('Veuillez d’abord sélectionner un fichier ou coller le contenu JSON de sauvegarde.');
      return;
    }
    const success = importBackup(importJsonText);
    if (success) {
      setImportFeedback({
        success: true,
        message: 'Restauration terminée avec succès ! Toutes les données de l’application ont été actualisées.',
      });
      setImportJsonText('');
      setTimeout(() => {
        setImportFeedback(null);
        setIsBackupModalOpen(false);
      }, 2500);
    } else {
      setImportFeedback({
        success: false,
        message: 'Échec de la restauration : format de données incompatible ou corrompu.',
      });
    }
  };

  const handleCreateNewSnapshot = () => {
    const name = newSnapshotName.trim() || undefined;
    createSnapshot(name);
    setNewSnapshotName('');
  };

  const handleRunRepair = () => {
    setRepairRunning(true);
    setRepairSuccessBanner(null);

    setTimeout(() => {
      const rep = repairData();
      setCurrentReport(rep);
      setRepairRunning(false);
      setRepairSuccessBanner(
        rep.fixedCount > 0
          ? `Réparation effectuée : ${rep.fixedCount} anomalie(s) corrigée(s) et sauvegardée(s) avec succès !`
          : 'Diagnostic complet : Vos données sont 100% saines, aucun bug ou anomalie détecté.'
      );
      setTimeout(() => setRepairSuccessBanner(null), 5000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Centre de Sauvegarde & Effacement des Bugs</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Sécurité Données
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Sauvegardez vos données, restaurez un point antérieur et nettoyez les anomalies d’atelier en 1 clic.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBackupModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-6 gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('repair')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'repair'
                ? 'border-sky-600 text-sky-800 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4 text-sky-600" />
            <span>Effacer les Bugs & Diagnostic</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'export'
                ? 'border-sky-600 text-sky-800 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Télécharger la Sauvegarde (JSON)</span>
          </button>

          <button
            onClick={() => setActiveTab('snapshots')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'snapshots'
                ? 'border-sky-600 text-sky-800 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Points de Restauration ({snapshots.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'import'
                ? 'border-sky-600 text-sky-800 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4 text-amber-600" />
            <span>Restaurer un Fichier</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: EFFACER LES BUGS & DIAGNOSTIC */}
          {activeTab === 'repair' && (
            <div className="space-y-6">
              {/* Hero Action Card */}
              <div className="p-5 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50/70 via-white to-blue-50/50 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-sky-700" />
                      <h3 className="font-bold text-slate-900 text-sm">
                        Outil d'audit & de nettoyage automatique des données
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 max-w-xl">
                      Cet outil vérifie l’intégrité complète de votre base locale : raccroche les véhicules ou rendez-vous orphelins, recalcule les totaux HT/TTC et TVA des devis et factures, nettoie les valeurs invalides et crée un point de sauvegarde certifié propre.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRunRepair}
                    disabled={repairRunning}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm transition-all hover:opacity-95 active:scale-98 shrink-0 disabled:opacity-50"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <RefreshCw className={`w-4 h-4 ${repairRunning ? 'animate-spin' : ''}`} />
                    <span>{repairRunning ? 'Diagnostic en cours...' : 'Lancer le diagnostic & Effacer les bugs'}</span>
                  </button>
                </div>

                {repairSuccessBanner && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{repairSuccessBanner}</span>
                  </div>
                )}
              </div>

              {/* Data overview count cards */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  État des enregistrements actuels dans l'application
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <Users className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                    <span className="block text-lg font-black text-slate-900">{clients.length}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Clients</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <Car className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                    <span className="block text-lg font-black text-slate-900">{vehicles.length}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Véhicules</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <FileText className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                    <span className="block text-lg font-black text-slate-900">{documents.length}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Devis & Factures</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <Clock className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                    <span className="block text-lg font-black text-slate-900">{appointments.length}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Rendez-vous</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <Coins className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                    <span className="block text-lg font-black text-slate-900">{cashTransactions.length}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Opérations Caisse</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <Truck className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                    <span className="block text-lg font-black text-slate-900">{supplierOrders.length}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Commandes Pièces</span>
                  </div>
                </div>
              </div>

              {/* Latest Audit Report */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Dernier rapport d'audit et de nettoyage :</span>
                  </h4>
                  {currentReport && (
                    <span className="text-[11px] text-slate-500">
                      Exécuté le {formatDate(currentReport.timestamp.split('T')[0])} à{' '}
                      {new Date(currentReport.timestamp).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                {currentReport ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          currentReport.fixedCount > 0
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        {currentReport.fixedCount > 0
                          ? `${currentReport.fixedCount} correction(s) apportée(s)`
                          : 'Zéro anomalie détectée'}
                      </span>
                    </div>

                    <ul className="divide-y divide-slate-200 bg-white rounded-lg border border-slate-200 overflow-hidden text-xs text-slate-700">
                      {currentReport.details.map((detail, idx) => (
                        <li key={idx} className="p-2.5 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Aucun rapport pour le moment. Cliquez sur « Lancer le diagnostic & Effacer les bugs » ci-dessus.
                  </p>
                )}
              </div>

              {/* Reset to clean reference data button */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Option de réinitialisation d'usine propre (Données de référence)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Remet l'ensemble des modules d'atelier à leur état de démonstration certifié sans bug (un point de sauvegarde automatique sera créé par sécurité avant la réinitialisation).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        'Êtes-vous certain de vouloir rétablir les données de référence d’origine ?\n\nUne sauvegarde automatique de vos données actuelles sera conservée dans vos points de restauration.'
                      )
                    ) {
                      resetAllData();
                      alert('Données réinitialisées avec succès sur la base propre de référence !');
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rétablir les données d'origine</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EXPORTER / TÉLÉCHARGER LA SAUVEGARDE */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Download className="w-5 h-5 text-emerald-600" />
                      <span>Télécharger votre sauvegarde intégrale (Fichier .JSON)</span>
                    </h3>
                    <p className="text-xs text-slate-600 max-w-xl">
                      Ce fichier contient l'intégralité de vos clients, cartes grises véhicules, devis, factures, journal de caisse, fournisseurs, mécaniciens et configuration visuelle.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyBackup}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{copied ? 'Copié !' : 'Copier JSON'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={downloadBackupFile}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Télécharger le fichier</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* JSON preview */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Aperçu du contenu de la sauvegarde :
                </label>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-200 font-mono text-[11px] max-h-60 overflow-y-auto select-all">
                  <pre>{exportBackup()}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: POINTS DE RESTAURATION (SNAPSHOTS) */}
          {activeTab === 'snapshots' && (
            <div className="space-y-6">
              {/* Create snapshot block */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="Nom ou motif du point de sauvegarde (ex: Avant clôture mensuelle...)"
                  value={newSnapshotName}
                  onChange={(e) => setNewSnapshotName(e.target.value)}
                  className="flex-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-sky-500 bg-white"
                />
                <button
                  type="button"
                  onClick={handleCreateNewSnapshot}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Créer un point maintenant</span>
                </button>
              </div>

              {/* Snapshots list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Points de sauvegarde enregistrés en mémoire locale ({snapshots.length})
                </h4>

                {snapshots.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs">
                    Aucun point de sauvegarde enregistré pour l’instant. Cliquez sur « Créer un point maintenant » pour immortaliser l'état actuel de votre atelier.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                    {snapshots.map((snap) => (
                      <div
                        key={snap.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{snap.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formatDate(snap.timestamp.split('T')[0])} ·{' '}
                              {new Date(snap.timestamp).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                            <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                              {snap.counts.clients} clients
                            </span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                              {snap.counts.vehicles} véhicules
                            </span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                              {snap.counts.documents} factures/devis
                            </span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                              {snap.counts.appointments} RDV
                            </span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                              {snap.counts.cashTransactions} opérations caisse
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                confirm(
                                  `Restaurer le point « ${snap.name} » ?\n\nUne sauvegarde de l'état actuel sera automatiquement créée par précaution.`
                                )
                              ) {
                                restoreSnapshot(snap.id);
                                alert('Point de sauvegarde restauré avec succès !');
                              }
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
                            <span>Restaurer</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteSnapshot(snap.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Supprimer ce point"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: RESTAURER UN FICHIER DE SAUVEGARDE */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
                <h4 className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Restauration depuis un fichier externe</span>
                </h4>
                <p className="text-xs text-amber-800">
                  Sélectionnez un fichier JSON de sauvegarde préalablement exporté. Par mesure de sécurité, l'application crée automatiquement un point de sauvegarde instantané de votre état actuel avant d'appliquer la restauration.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-sky-500 bg-slate-50 hover:bg-sky-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">
                  Cliquez ici pour choisir un fichier de sauvegarde (.json)
                </p>
                <p className="text-[11px] text-slate-400">ou collez le texte JSON ci-dessous</p>
              </div>

              {importFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                    importFeedback.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  {importFeedback.success ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{importFeedback.message}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Coller le texte JSON brut (Optionnel) :
                </label>
                <textarea
                  rows={4}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Collez ici le contenu JSON complet de sauvegarde..."
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:border-sky-500 bg-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={!importJsonText.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white transition-opacity hover:opacity-95 shadow-xs disabled:opacity-40"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <Upload className="w-4 h-4" />
                  <span>Confirmer et Restaurer la Sauvegarde</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sauvegardes chiffrées localement et certifiées conformes</span>
          </span>
          <button
            type="button"
            onClick={() => setIsBackupModalOpen(false)}
            className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
