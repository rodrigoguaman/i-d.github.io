"""Analyze appearances in a Top-50 dataset, not sales or market shares."""

import argparse
import csv
from collections import Counter, defaultdict
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv_file", type=Path, help="Path to bestsellers_with_categories.csv")
    args = parser.parse_args()
    with args.csv_file.open(encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        required = {"Name", "Author", "Year", "Genre"}
        if not required.issubset(reader.fieldnames or []):
            parser.error(f"Missing columns: {', '.join(sorted(required - set(reader.fieldnames or [])))}")
        rows = list(reader)

    appearances = defaultdict(set)
    genres = Counter()
    years = Counter()
    for row in rows:
        appearances[(row["Name"].strip(), row["Author"].strip())].add(row["Year"].strip())
        genres[(row["Year"].strip(), row["Genre"].strip())] += 1
        years[row["Year"].strip()] += 1
    print(f"Records: {len(rows)} | Unique title-author pairs: {len(appearances)}")
    print("\nYears in the Top 50 (not units sold):")
    for (title, author), seen in sorted(appearances.items(), key=lambda item: (-len(item[1]), item[0][0]))[:10]:
        print(f"{len(seen):2} | {title} | {author}")
    print("\nAppearances by year and genre:")
    for (year, genre), count in sorted(genres.items()):
        print(f"{year} | {genre} | {count} of {years[year]}")
    print("\nThis dataset cannot establish market growth or relative market share.")


if __name__ == "__main__":
    main()
