'use server'

import postgres from 'postgres';
import {
  crafting_methods,
  ItemData
} from '@/app/lib/types';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function deleteSavedTrip(tripID: string) {
  try {
    console.log(`Deleting saved calculation ID: ${tripID}`);

    // Query
    const result = await sql`
      DELETE FROM custom_calculations
      WHERE id = ${tripID}
    `;

    if (result.count === 0) {
      return { success: false, message: 'Calculation not found or you do not have permission to delete it' };
    }

    return {
      success: true,
      message: 'Calculation successfully deleted',
      tripID
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete saved calculation.');
  }
}