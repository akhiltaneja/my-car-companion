import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Vehicle, FuelType } from '@/types';

export function useVehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const fetchVehicles = useCallback(async () => {
    if (!user) {
      setVehicles([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vehicles:', error);
    } else {
      const vehicleData = (data || []).map(v => ({
        ...v,
        fuel_type: v.fuel_type as FuelType,
      })) as Vehicle[];
      setVehicles(vehicleData);
      
      // Set default vehicle
      const defaultVehicle = vehicleData.find(v => v.is_default) || vehicleData[0];
      if (defaultVehicle && !selectedVehicle) {
        setSelectedVehicle(defaultVehicle);
      }
    }
    setLoading(false);
  }, [user, selectedVehicle]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    // If this is the first vehicle or marked as default, update others
    if (vehicle.is_default && vehicles.length > 0) {
      await supabase
        .from('vehicles')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        ...vehicle,
        user_id: user.id,
        is_default: vehicles.length === 0 ? true : vehicle.is_default,
      })
      .select()
      .single();

    if (!error && data) {
      const newVehicle = { ...data, fuel_type: data.fuel_type as FuelType } as Vehicle;
      setVehicles(prev => [newVehicle, ...prev]);
      if (newVehicle.is_default || vehicles.length === 0) {
        setSelectedVehicle(newVehicle);
      }
    }
    return { error, data };
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    if (!user) return { error: new Error('Not authenticated') };

    // If setting as default, unset others
    if (updates.is_default) {
      await supabase
        .from('vehicles')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .neq('id', id);
    }

    const { error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } as Vehicle : v));
      if (selectedVehicle?.id === id) {
        setSelectedVehicle(prev => prev ? { ...prev, ...updates } as Vehicle : null);
      }
    }
    return { error };
  };

  const deleteVehicle = async (id: string) => {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (!error) {
      setVehicles(prev => {
        const remaining = prev.filter(v => v.id !== id);
        if (selectedVehicle?.id === id) {
          setSelectedVehicle(remaining[0] || null);
        }
        return remaining;
      });
    }
    return { error };
  };

  const selectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  return {
    vehicles,
    loading,
    selectedVehicle,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    selectVehicle,
    refetch: fetchVehicles,
  };
}
