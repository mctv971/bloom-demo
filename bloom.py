class BitSet:
    def __init__(self, size: int):
        if size <= 0:
            raise ValueError("La taille doit être > 0")
        self.size = size
        self.array = bytearray((size + 7) // 8)  # assez d'octets pour 'size' bits

    def _check_index(self, index: int):
        if not (0 <= index < self.size):
            raise IndexError("Index hors limites")

    def set(self, index: int):
        """Met le bit à 1"""
        self._check_index(index)
        byte_index = index // 8
        mask = 1 << (index % 8)
        self.array[byte_index] |= mask

    def get(self, index: int) -> bool:
        """Retourne True si le bit est à 1"""
        self._check_index(index)
        byte_index = index // 8
        mask = 1 << (index % 8)
        return (self.array[byte_index] & mask) != 0

    def clear(self, index: int):
        """Met le bit à 0"""
        self._check_index(index)
        byte_index = index // 8
        mask = 1 << (index % 8)
        self.array[byte_index] &= ~mask

    def clear_all(self):
        """Remet tout à 0"""
        for i in range(len(self.array)):
            self.array[i] = 0

    def bit_count(self) -> int:
        """Retourne le nombre total de bits à 1"""
        return sum(bin(byte).count("1") for byte in self.array)

    def size_in_bits(self) -> int:
        """Retourne la taille totale (en bits)"""
        return self.size

    def fill_ratio(self) -> float:
        """Retourne le taux de remplissage (entre 0 et 1)"""
        return self.bit_count() / self.size if self.size else 0.0


import math, hashlib

class BloomFilter:
    def __init__(self, capacity: int, error_rate: float):
        if capacity <= 0:
            raise ValueError("Capacity doit être > 0")
        if not (0 < error_rate < 1):
            raise ValueError("Error_rate doit être entre 0 et 1")

        self.capacity = capacity
        self.error_rate = error_rate

        # Taille en bits (m) et nombre de hash (k)
        self.m = math.ceil(-capacity * math.log(error_rate) / (math.log(2) ** 2))
        self.k = max(1, round(self.m / capacity * math.log(2)))

        # BitSet sous-jacent
        self.bitset = BitSet(self.m)
        self.count = 0  # nb d’éléments ajoutés

    def _hashes(self, item: str):
        """Double hashing pour générer k indices"""
        # Normalisation en bytes
        if isinstance(item, str):
            data = item.encode("utf-8")
        elif isinstance(item, bytes):
            data = item
        else:
            data = str(item).encode("utf-8")

        h1 = int.from_bytes(hashlib.sha256(data).digest(), 'big')
        h2 = int.from_bytes(hashlib.md5(data).digest(), 'big')

        for i in range(self.k):
            yield (h1 + i * h2) % self.m

    def add(self, item):
        """Ajoute un élément"""
        for idx in self._hashes(item):
            self.bitset.set(idx)
        self.count += 1

    def __contains__(self, item) -> bool:
        """Teste si un élément est peut-être présent"""
        return all(self.bitset.get(idx) for idx in self._hashes(item))

    def __len__(self):
        return self.count
    
    def bit_count(self) -> int:
        """Retourne le nombre total de bits à 1 dans le filtre"""
        return self.bitset.bit_count()

    def fill_ratio(self) -> float:
        """Taux de remplissage du filtre (entre 0 et 1)"""
        return self.bitset.fill_ratio()

    def stats(self) -> dict:
        """Retourne un résumé global du filtre"""
        return {
            "capacity": self.capacity,
            "error_rate": self.error_rate,
            "bits_total": self.m,
            "bits_on": self.bit_count(),
            "fill_ratio": round(self.fill_ratio() * 100, 2),
            "hash_functions": self.k,
            "elements_added": self.count
        }
