import type { Linter } from 'eslint'

declare const besties: {
	readonly meta: {
		readonly name: string;
		readonly version: string;
	};
	readonly configs: {
		readonly js: { readonly rules: Readonly<Linter.RulesRecord> };
		readonly ts: { readonly rules: Readonly<Linter.RulesRecord> };
		readonly svelte: { readonly rules: Readonly<Linter.RulesRecord> };
	};
};

export = besties;
