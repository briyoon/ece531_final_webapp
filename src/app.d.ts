// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface LoginCredentials {
		username: string;
		password: string;
	}

	interface TokenResponse {
		access_token: string;
		token_type: string;
	}

	interface UserDevice {
		device_id: string;
		user_id: string;
		schedule: ThermostatSchedule | null;
	}

	interface ThermostatReport {
		temperature_celcius: number;
		heater_on: boolean;
		timestamp: string;
	}

	interface TimeSlot {
		time: string;
		temperature: number;
	}

	interface DaySchedule {
		day: string;
		slots: TimeSlot[];
	}

	interface ThermostatSchedule {
		schedule: DaySchedule[];
	}
}

export {};
