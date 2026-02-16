import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '@/shared/hooks/usePatient';
import { PatientCard } from '@/shared/components/PatientCard';
import type { PatientSearchResult } from '@/shared/types';
import { Search, Filter, UserPlus } from 'lucide-react';

export function PatientSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<PatientSearchResult[]>([]);
    const [searched, setSearched] = useState(false);
    const { searchPatients, loading } = usePatient();
    const navigate = useNavigate();

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;
        setSearched(true);
        const data = await searchPatients(query);
        setResults(data);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header flex items-center justify-between">
                <div>
                    <h1 className="page-title">Patient Search</h1>
                    <p className="page-subtitle">Search by MRN, name, phone, FCN, or Progress ID</p>
                </div>
                <button
                    onClick={() => navigate('/patients/register')}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-md shadow-primary/20"
                >
                    <UserPlus className="h-4 w-4" />
                    Register New
                </button>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by MRN, name, phone, FCN, or Progress ID..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border bg-card text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all shadow-sm"
                        autoFocus
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-md shadow-primary/20 flex items-center gap-2"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                        <Search className="h-4 w-4" />
                    )}
                    Search
                </button>
                <button
                    type="button"
                    className="px-4 py-3 border rounded-xl hover:bg-muted/50 transition-colors"
                    title="Filters"
                >
                    <Filter className="h-4 w-4" />
                </button>
            </form>

            {/* Results */}
            {searched && (
                <div>
                    <p className="text-sm text-muted-foreground mb-3">
                        {loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} found`}
                    </p>
                    {results.length > 0 ? (
                        <div className="space-y-3">
                            {results.map((patient) => (
                                <PatientCard
                                    key={patient.id}
                                    patient={patient}
                                    onClick={() => navigate(`/patients/${patient.id}`)}
                                />
                            ))}
                        </div>
                    ) : !loading && (
                        <div className="text-center py-12 bg-card rounded-xl border">
                            <Search className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                            <p className="mt-4 text-muted-foreground">No patients found matching "{query}"</p>
                            <button
                                onClick={() => navigate('/patients/register')}
                                className="mt-3 text-primary text-sm font-medium hover:underline flex items-center gap-1 mx-auto"
                            >
                                <UserPlus className="h-4 w-4" />
                                Register as new patient
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Quick search hints */}
            {!searched && (
                <div className="text-center py-16">
                    <Search className="h-16 w-16 text-muted-foreground/20 mx-auto" />
                    <p className="mt-4 text-lg font-medium text-muted-foreground">Search for a patient</p>
                    <p className="mt-1 text-sm text-muted-foreground/70">
                        You can search by MRN (e.g., MRN-2026-001234), name, phone number, FCN, or Progress ID
                    </p>
                </div>
            )}
        </div>
    );
}
