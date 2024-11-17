import localforage from "localforage";

// Fungsi untuk menyimpan data ke cache dengan waktu kedaluwarsa (default 10 menit)
export const setCache = async (
	key: string,
	value: any,
	ttl: number = 3153600000,
) => {
	try {
		const expiresAt = Date.now() + ttl;
		const cacheData = { value, expiresAt };
		await localforage.setItem(key, cacheData);
	} catch (error) {
		console.error("Failed to set cache:", error);
	}
};

// Fungsi untuk mengambil data dari cache dan memvalidasi waktu kedaluwarsa
export const getCache = async (key: string) => {
	try {
		const cacheData: { value: any; expiresAt: number } | null =
			await localforage.getItem(key);
		if (cacheData) {
			const { value, expiresAt } = cacheData;
			if (Date.now() < expiresAt) {
				return value;
			} else {
				// Hapus cache jika sudah kedaluwarsa
				await deleteCache(key);
				return null;
			}
		}
		return null;
	} catch (error) {
		console.error("Failed to get cache:", error);
		return null;
	}
};

// Fungsi untuk menghapus data dari cache
export const deleteCache = async (key: string) => {
	try {
		await localforage.removeItem(key);
	} catch (error) {
		console.error("Failed to delete cache:", error);
	}
};

export const deleteMultipleCaches = async (keys: string[]) => {
	try {
		const deletePromises = keys.map((key) => localforage.removeItem(key));
		await Promise.all(deletePromises);
		console.log("Selected caches deleted successfully.");
	} catch (error) {
		console.error("Failed to delete multiple caches:", error);
	}
};

// Fungsi untuk menghapus semua data dari cache
export const deleteAllCache = async () => {
	try {
		await localforage.clear();
	} catch (error) {
		console.error("Failed to delete all cache:", error);
	}
};

// Fungsi untuk menghapus cache berdasarkan kategori (prefix tertentu)
export const deleteCacheByCategory = async (categoryPrefix: string) => {
	try {
		await localforage.iterate((value, key) => {
			if (key.startsWith(categoryPrefix)) {
				localforage.removeItem(key);
			}
		});
	} catch (error) {
		console.error("Failed to delete cache by category:", error);
	}
};

// Fungsi untuk mengubah data di cache (mutasi)
export const mutateCache = async (
	key: string,
	mutator: (value: any) => any,
): Promise<{ success: boolean; error: string | null }> => {
	try {
		const currentValue = await getCache(key);

		// Jika data tidak ada di cache, kembalikan status gagal
		if (!currentValue) {
			return { success: false, error: "Data not found in cache" };
		}

		// Gunakan mutator untuk memperbarui data
		const newValue = mutator(currentValue);

		// Simpan nilai baru ke cache
		await setCache(key, newValue);

		// Kembalikan status berhasil
		return { success: true, error: null };
	} catch (error) {
		console.error("Failed to mutate cache:", error);
		return { success: false, error: "Failed to mutate cache" };
	}
};

// Fungsi untuk mencari data dari cache berdasarkan kondisi
export const findInCache = async (
	predicate: (value: any, key: string) => boolean,
) => {
	try {
		const keys = await localforage.keys();
		for (const key of keys) {
			const value = await getCache(key);
			if (predicate(value, key)) {
				return { key, value };
			}
		}
		return null;
	} catch (error) {
		console.error("Failed to find in cache:", error);
		return null;
	}
};
