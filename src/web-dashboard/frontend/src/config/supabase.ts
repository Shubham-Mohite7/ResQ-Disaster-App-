import { createClient } from '@supabase/supabase-js';

// Supabase configuration for Vercel deployment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Important data tables for disaster management
export interface DisasterRecord {
  id: string;
  type: string;
  severity: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'active' | 'resolved' | 'monitoring';
  affected_population: number;
  description: string;
  created_at: string;
  updated_at: string;
  source: 'local' | 'usgs' | 'gdacs' | 'user_report';
}

export interface UserReport {
  id: string;
  name: string;
  phone: string;
  email?: string;
  report_type: 'sos' | 'missing_person' | 'resource_request' | 'damage_report';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface ReliefResource {
  id: string;
  name: string;
  type: 'shelter' | 'food' | 'medical' | 'rescue_team' | 'supplies';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  capacity: number;
  current_occupancy: number;
  availability: 'available' | 'full' | 'unavailable';
  contact_phone: string;
  contact_person: string;
  created_at: string;
  updated_at: string;
}

// Supabase service functions
export const supabaseService = {
  // Disaster records
  async saveDisasterRecord(disaster: Omit<DisasterRecord, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('disaster_records')
      .insert({
        ...disaster,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getDisasterRecords(limit = 100) {
    const { data, error } = await supabase
      .from('disaster_records')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // User reports
  async saveUserReport(report: Omit<UserReport, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('user_reports')
      .insert({
        ...report,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserReports(status?: string) {
    let query = supabase
      .from('user_reports')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  // Relief resources
  async saveReliefResource(resource: Omit<ReliefResource, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('relief_resources')
      .insert({
        ...resource,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getReliefResources(type?: string) {
    let query = supabase
      .from('relief_resources')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  // Analytics
  async getDisasterStats() {
    const { data, error } = await supabase
      .from('disaster_records')
      .select('type, severity, status, affected_population');
    
    if (error) throw error;
    
    // Calculate statistics
    const stats = {
      total: data.length,
      active: data.filter(d => d.status === 'active').length,
      by_type: {} as Record<string, number>,
      by_severity: {} as Record<string, number>,
      total_affected: data.reduce((sum, d) => sum + (d.affected_population || 0), 0)
    };
    
    data.forEach(disaster => {
      stats.by_type[disaster.type] = (stats.by_type[disaster.type] || 0) + 1;
      stats.by_severity[disaster.severity] = (stats.by_severity[disaster.severity] || 0) + 1;
    });
    
    return stats;
  }
};

export default supabaseService;
