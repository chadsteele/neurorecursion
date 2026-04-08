<script>
	import {slide} from "svelte/transition"
	import {Categories} from "$lib/Categories.js"
	import {ConditionsMap} from "$lib/Conditions.js"

	let {formData = {}} = $props()

	// Local state for tracking which categories are expanded
	let expanded = $state({})

	function toggleCategory(categoryName) {
		expanded[categoryName] = !expanded[categoryName]
	}

	function hasBranchContent(categoryIds) {
		return categoryIds.some((conditionId) => {
			const condition = ConditionsMap[conditionId]
			return condition && formData.conditions[condition.name]
		})
	}

	// Check if category is explicitly expanded by user
	function isExpanded(categoryName) {
		return expanded[categoryName] === true
	}

	function getCheckedConditions(categoryIds) {
		return categoryIds.filter((conditionId) => {
			const condition = ConditionsMap[conditionId]
			return condition && formData.conditions[condition.name]
		})
	}
</script>

<div class="condition-grid">
	{#each Categories as category (category.category_name)}
		{@const hasContent = hasBranchContent(category.ids)}
		<div class="category-branch" class:has-content={hasContent}>
			<button
				type="button"
				class="category-header"
				onclick={() => toggleCategory(category.category_name)}
			>
				<span
					class="expand-arrow"
					class:expanded={expanded[category.category_name]}
				>
					▶
				</span>
				<span class="category-label">
					{category.category_name}
				</span>
			</button>

			{#if isExpanded(category.category_name)}
				<div
					class="category-conditions"
					transition:slide={{duration: 300}}
				>
					<a href={`#${category.ids[0]}`} class="read-more"
						>🔍 Learn</a
					>
					{#each category.ids as conditionId (conditionId)}
						{@const condition = ConditionsMap[conditionId]}
						{#if condition}
							<div class="condition-item">
								<input
									type="checkbox"
									id={`condition-${condition.id}`}
									bind:checked={
										formData.conditions[condition.name]
									}
									class="condition-checkbox"
								/>
								<label
									for={`condition-${condition.id}`}
									class="condition-label"
								>
									{condition.name}
								</label>
							</div>
						{/if}
					{/each}
				</div>
			{:else}
				{@const checkedIds = getCheckedConditions(category.ids)}
				{#if checkedIds.length > 0}
					<div class="category-conditions-collapsed">
						{#each checkedIds as conditionId (conditionId)}
							{@const condition = ConditionsMap[conditionId]}
							{#if condition}
								<div class="condition-item">
									<input
										type="checkbox"
										id={`condition-${condition.id}`}
										bind:checked={
											formData.conditions[condition.name]
										}
										class="condition-checkbox"
									/>
									<label for={`condition-${condition.id}`}>
										{condition.name}
									</label>
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	{/each}
</div>

<style>
	.condition-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	@media (max-width: 1024px) {
		.condition-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 640px) {
		.condition-grid {
			grid-template-columns: 1fr;
		}
	}

	.category-branch {
		border-left: 3px solid rgba(74, 159, 216, 0.2);
		transition: all 0.3s ease;
		border-radius: 4px;
		overflow: hidden;
	}

	.category-branch.has-content {
		border-left-color: rgba(74, 159, 216, 0.6);
		background: rgba(74, 159, 216, 0.05);
	}

	.category-header {
		display: flex;
		align-items: center;
		padding: 0.5rem 0.75rem;
		cursor: pointer;
		transition: background 0.2s ease;
		background: rgba(26, 36, 71, 0.6);
		border: none;
		border-bottom: 1px solid rgba(74, 159, 216, 0.2);
		width: 100%;
		text-align: left;
		font-size: inherit;
		font-family: inherit;
		color: inherit;
	}

	.category-header:hover {
		background: rgba(74, 159, 216, 0.1);
	}

	.expand-arrow {
		display: inline-block;
		transition: transform 0.3s ease;
		margin-right: 0.5rem;
	}

	.expand-arrow.expanded {
		transform: rotate(90deg);
	}

	.category-label {
		margin: 0;
		color: #a0d8ff;
		font-weight: 600;
		cursor: pointer;
	}

	.category-conditions {
		display: flex;
		flex-direction: column;
		padding: 0.5rem;
		gap: 0.25rem;
		overflow: hidden;
	}

	.category-conditions-collapsed {
		display: flex;
		flex-direction: column;
		padding: 0.5rem;
		gap: 0.25rem;
		overflow: hidden;
	}

	.condition-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.2s ease;
	}

	.condition-item:hover {
		background: rgba(74, 159, 216, 0.1);
		padding: 0.25rem;
		border-radius: 3px;
	}

	.condition-checkbox {
		min-width: 18px;
		width: 18px;
		height: 18px;
		cursor: pointer;
		accent-color: #4a9fd8;
		flex-shrink: 0;
	}

	.condition-label {
		margin: 0;
		color: #d0d0d0;
		font-weight: 500;
		cursor: pointer;
		flex: 1;
		font-size: 0.95rem;
		text-decoration: none;
	}

	.read-more {
		display: inline-block;
		margin-top: 0.5rem;
		padding: 0.5rem 0.75rem;
		color: #4a9fd8;
		text-decoration: none;
		font-size: 0.9rem;
		font-weight: 500;
		transition: all 0.2s ease;
		border-radius: 3px;
	}

	.read-more:hover {
		color: #5aafed;
		background: rgba(74, 159, 216, 0.15);
	}

	.read-more:active {
		transform: scale(0.98);
	}
</style>
